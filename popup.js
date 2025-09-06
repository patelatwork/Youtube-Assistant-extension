document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const setupSection = document.getElementById('setup-section');
  const readySection = document.getElementById('ready-section');
  const statusDiv = document.getElementById('status');
  const openChatButton = document.getElementById('openChatButton');
  const changeKeyButton = document.getElementById('changeKeyButton');

  // Load saved API key
  chrome.storage.sync.get(['openaiApiKey'], function(result) {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
      showReadyState();
    }
  });

  // Save API key
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter your OpenAI API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format. Should start with "sk-"', 'error');
      return;
    }

    // Check if on YouTube
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('youtube.com/watch')) {
        showStatus('Please navigate to a YouTube video first', 'error');
        return;
      }

      // Save API key
      chrome.storage.sync.set({openaiApiKey: apiKey}, function() {
        showStatus('API key saved successfully!', 'success');
        setTimeout(() => {
          showReadyState();
        }, 1500);
      });
    });
  });

  // Open chat interface
  openChatButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('youtube.com/watch')) {
        showStatus('Please navigate to a YouTube video first', 'error');
        return;
      }

      // Send message to content script to open chat
      chrome.tabs.sendMessage(currentTab.id, {action: 'openChat'}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Please refresh the YouTube page and try again', 'error');
        } else {
          window.close(); // Close popup
        }
      });
    });
  });

  // Change API key
  changeKeyButton.addEventListener('click', function() {
    showSetupState();
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
    
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  }

  function showReadyState() {
    setupSection.classList.add('hidden');
    readySection.classList.remove('hidden');
  }

  function showSetupState() {
    setupSection.classList.remove('hidden');
    readySection.classList.add('hidden');
  }
});
