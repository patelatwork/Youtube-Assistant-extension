// Background script for the YouTube Q&A extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Q&A Assistant extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, which is handled by popup.html
});

// Optional: Add context menu for right-click functionality
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "askAboutVideo",
    title: "Ask question about this video",
    contexts: ["page"],
    documentUrlPatterns: ["https://www.youtube.com/watch*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "askAboutVideo") {
    // Send message to content script to open chat
    chrome.tabs.sendMessage(tab.id, {action: 'openChat'});
  }
});

// Listen for tab updates to check if user is on YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => {
      // Script might already be injected, that's okay
    });
  }
});
