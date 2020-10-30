'use strict';

/**
 * @see https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon/28765872#28765872
 */
function createSetIconAction(path, callback) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.addEventListener("load", () => {
    ctx.drawImage(image, 0, 0, 16, 16);
    var imageData = ctx.getImageData(0, 0, 16, 16);
    var action = new chrome.declarativeContent.SetIcon({ imageData });
    callback(action);
  });
  image.src = chrome.runtime.getURL(path);
}

function updateDeclarativeRules(callback) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.storage.sync.get('githubOwners', ({ githubOwners }) => {
      const githubOwnersList = githubOwners.split(',').map(s => s.trim());
      const conditions = githubOwnersList.map((owner) => {
        // https://github.com/{owner}/{repo}/issues/{issueNumber}
        return new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: "github.com",
            // pathPrefix: owner,
            pathContains: "/issues/"
          }
        });
      })
      // Register the page action rule for GitHub issues on the specific owners
      createSetIconAction("icon-active-16.png", (setIconAction) => {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions,
          actions: [
            new chrome.declarativeContent.ShowPageAction(),
            setIconAction,
          ]
        }], callback);
      });
    });
  });
}

function gotoJiraFromTab(tab) {
  const gitHubUrl = tab.url;
  const match = gitHubUrl.match(/^https:\/\/github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)\/issues\/(?<issueNumber>[\d]+)$/);
  if (match) {
    const { owner, repo, issueNumber } = match.groups;
    // Perform a search towards the Jira API
    chrome.storage.sync.get(["baseUrl", "jql"], ({ baseUrl, jql }) => {
      const query = jql.replace("{issueNumber}", issueNumber);
      const url = baseUrl + '/rest/api/2/search?jql=' + encodeURIComponent(query);
      
      fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(json => {
        // Find an issue with field value pointing to the GitHub URL
        const issue = json.issues.find(issue => {
          return Object.values(issue.fields).includes(gitHubUrl);
        });
        // If we found such an issue - open it
        if (issue) {
          // Open the issue in a new tab
          const jiraUrl = baseUrl + "/browse/" + issue.key;
          chrome.tabs.create({
            url: jiraUrl,
            index: tab.index + 1,
            openerTabId: tab.id,
          });
        }
      })
      .catch(console.error);
    });
  }
}

chrome.storage.onChanged.addListener((changes) => {
  updateDeclarativeRules();
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "goto-jira") {
    gotoJiraFromTab(tab);
  }
});

chrome.pageAction.onClicked.addListener((tab) => {
  gotoJiraFromTab(tab);
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    // TODO: Use some more 
    baseUrl: '',
    jql: '"GitHub#" ~ "{issueNumber}"',
    githubOwners: '',
  }, () => {
    console.log("Default settings has been stored");
  });

  updateDeclarativeRules(() => {
    chrome.runtime.openOptionsPage();
  });
});

