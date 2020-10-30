'use strict';

const baseUrlElement = document.getElementById("baseUrl");
const jqlElement = document.getElementById("jql");
const githubOwnersElement = document.getElementById("githubOwners");

function storeOption({ target }) {
  chrome.storage.sync.set({ [target.id]: target.value });
}

function restoreOptions() {
  chrome.storage.sync.get([
    'baseUrl',
    'jql',
    'githubOwners'
  ], ({ baseUrl, jql, githubOwners }) => {
    baseUrlElement.value = baseUrl;
    jqlElement.value = jql;
    githubOwnersElement.value = githubOwners;
  });
}

// Register listeners to store options when input elements change values
baseUrlElement.addEventListener("change", storeOption);
jqlElement.addEventListener("change", storeOption);
githubOwnersElement.addEventListener("change", storeOption);

// Register a listener to restore values from storage when the content has loaded
document.addEventListener('DOMContentLoaded', restoreOptions);
