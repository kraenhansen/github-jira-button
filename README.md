# Chrome Extension adding a button (and a shortcut) to open GitHub tickets in Jira (if they've been synced)

## Installing this magnificent extension

1. Clone the GitHub repository: `git clone git@github.com:kraenhansen/github-jira-button.git`
2. Go to the "Extensions" settings in your Chrome browser, by navigating to [chrome://extensions/](chrome://extensions/)
3. Toggle on "Developer mode" in the upper right side.
4. Click "Load unpacked" and select the repository.

## Using this magnificent extension

When on a GitHub issues page, either:
1. click the blue Jira icon to the right of the navigation / URL bar.
2. Press <kbd>Ctrl</kbd> + <kbd>J</kbd> (on Windows) or <kbd>Cmd</kbd> + <kbd>J</kbd> (on Mac)

## Employees of MongoDB / Realm

Use the following options:
- Base URL: `https://jira.mongodb.org`
- Jira Search Query: `"GitHub#" ~ "{issueNumber}"`
- GitHub owners: `realm`
