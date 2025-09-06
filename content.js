// Content script for YouTube pages
let chatInterface = null;
let videoData = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openChat') {
    openChatInterface();
    sendResponse({success: true});
  }
});

// Extract video information
function extractVideoData() {
  const videoTitle = document.querySelector('h1.title yt-formatted-string')?.textContent || 
                    document.querySelector('#title h1')?.textContent ||
                    document.querySelector('h1')?.textContent || 'Unknown Title';
  
  const channelName = document.querySelector('#text a')?.textContent ||
                     document.querySelector('#owner-name a')?.textContent ||
                     document.querySelector('.ytd-channel-name a')?.textContent || 'Unknown Channel';
  
  const videoUrl = window.location.href;
  const videoId = new URLSearchParams(window.location.search).get('v');
  
  // Try to get video description
  const description = document.querySelector('#description-text')?.textContent || 
                     document.querySelector('#meta-contents #description')?.textContent || '';

  return {
    title: videoTitle,
    channel: channelName,
    url: videoUrl,
    videoId: videoId,
    description: description.substring(0, 1000) // Limit description length
  };
}

// Open chat interface
function openChatInterface() {
  if (chatInterface) {
    chatInterface.style.display = 'block';
    return;
  }

  videoData = extractVideoData();

  // Create chat interface container
  chatInterface = document.createElement('div');
  chatInterface.id = 'youtube-qa-chat';
  chatInterface.innerHTML = `
    <div class="chat-header">
      <h3>🎥 Ask about this video</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="video-info">
      <strong>${videoData.title}</strong>
      <br><small>by ${videoData.channel}</small>
    </div>
    <div class="chat-messages" id="chatMessages">
      <div class="message bot-message">
        Hi! I'm ready to answer questions about this YouTube video. What would you like to know?
      </div>
    </div>
    <div class="chat-input-container">
      <input type="text" id="chatInput" placeholder="Ask a question about this video..." maxlength="500">
      <button id="sendButton">Send</button>
    </div>
    <div class="loading hidden" id="loadingIndicator">
      <div class="spinner"></div>
      Thinking...
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #youtube-qa-chat {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 420px;
      max-height: 650px;
      background: linear-gradient(135deg, #fefffe 0%, #f1f8e9 100%);
      border-radius: 25px;
      box-shadow: 0 8px 32px rgba(76, 175, 80, 0.2);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      border: 2px solid #e8f5e8;
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
      color: white;
      padding: 20px;
      border-radius: 25px 25px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }

    .chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .video-info {
      padding: 15px 20px;
      background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
      border-bottom: 2px solid #c8e6c9;
      font-size: 12px;
      color: #2d5016;
      font-weight: 500;
    }

    .chat-messages {
      flex: 1;
      max-height: 320px;
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(135deg, #fefffe 0%, #f9fdf9 100%);
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: #f1f8e9;
      border-radius: 10px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #81c784;
      border-radius: 10px;
    }

    .message {
      margin-bottom: 18px;
      padding: 15px 18px;
      border-radius: 20px;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      animation: messageSlide 0.3s ease-out;
    }

    @keyframes messageSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-message {
      background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
      margin-left: 25px;
      border-bottom-right-radius: 8px;
      color: #1b5e20;
      border: 1px solid #81c784;
    }

    .bot-message {
      background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
      margin-right: 25px;
      border-bottom-left-radius: 8px;
      color: #2d5016;
      border: 1px solid #c8e6c9;
    }

    .chat-input-container {
      display: flex;
      padding: 20px;
      background: linear-gradient(135deg, #fefffe 0%, #f1f8e9 100%);
      border-top: 2px solid #e8f5e8;
      border-radius: 0 0 25px 25px;
      gap: 12px;
    }

    #chatInput {
      flex: 1;
      padding: 15px 20px;
      border: 2px solid #e8f5e8;
      border-radius: 25px;
      font-size: 14px;
      outline: none;
      background: #fefffe;
      color: #2d5016;
      transition: all 0.3s ease;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    #chatInput:focus {
      border-color: #81c784;
      box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.2);
      transform: translateY(-1px);
    }

    #sendButton {
      padding: 15px 25px;
      background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      letter-spacing: 0.5px;
    }

    #sendButton:hover {
      background: linear-gradient(135deg, #5cb860 0%, #43a047 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    #sendButton:active {
      transform: translateY(0px);
      box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
    }

    #sendButton:disabled {
      background: #e0e0e0;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;
      color: #4a7c59;
      font-size: 13px;
      background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
      border-radius: 20px;
      margin: 0 20px 15px 20px;
      border: 1px solid #c8e6c9;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #e8f5e8;
      border-top: 2px solid #4caf50;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(chatInterface);

  // Add event listeners
  document.querySelector('.close-btn').addEventListener('click', () => {
    chatInterface.style.display = 'none';
  });

  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendButton.addEventListener('click', sendMessage);
}

// Send message to OpenAI
async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const sendButton = document.getElementById('sendButton');
  const loadingIndicator = document.getElementById('loadingIndicator');

  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'message user-message';
  userMessageDiv.textContent = message;
  chatMessages.appendChild(userMessageDiv);

  // Clear input and disable send button
  chatInput.value = '';
  sendButton.disabled = true;
  loadingIndicator.classList.remove('hidden');

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['openaiApiKey']);
    const apiKey = result.openaiApiKey;

    if (!apiKey) {
      throw new Error('No API key found. Please set your OpenAI API key.');
    }

    // Prepare the prompt
    const prompt = `You are a helpful assistant that answers questions about YouTube videos. Here's the video information:

Title: ${videoData.title}
Channel: ${videoData.channel}
URL: ${videoData.url}
Description: ${videoData.description}

User question: ${message}

Please provide a helpful and relevant answer about this video. If the question cannot be answered based on the provided information, let the user know that you would need to watch the actual video content to provide a more specific answer.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    // Add bot response
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';
    botMessageDiv.textContent = botResponse;
    chatMessages.appendChild(botMessageDiv);

  } catch (error) {
    console.error('Error:', error);
    
    // Add error message
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.className = 'message bot-message';
    errorMessageDiv.style.color = '#d32f2f';
    errorMessageDiv.textContent = `Sorry, I encountered an error: ${error.message}`;
    chatMessages.appendChild(errorMessageDiv);
  } finally {
    // Re-enable send button and hide loading
    sendButton.disabled = false;
    loadingIndicator.classList.add('hidden');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Focus back on input
    chatInput.focus();
  }
}
