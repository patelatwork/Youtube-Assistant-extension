# YouTube Video Q&A Chrome Extension

A Chrome extension that allows users to ask questions about YouTube videos using OpenAI's API.

## Features

- 🔑 Secure API key storage
- 🎥 Automatic video information extraction
- 💬 Interactive chat interface
- 🤖 AI-powered responses about video content
- 🎨 Beautiful, responsive UI

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your toolbar

## Usage

1. **Set up your API key:**
   - Click the extension icon in your toolbar
   - Enter your OpenAI API key (starts with `sk-`)
   - Click "Save & Ready to Answer"

2. **Ask questions about videos:**
   - Navigate to any YouTube video
   - Click the extension icon again
   - Click "Open Chat Interface"
   - Type your questions about the video in the chat interface

## API Key

You'll need an OpenAI API key to use this extension:
1. Visit [OpenAI's website](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API keys section
4. Create a new API key
5. Copy and paste it into the extension

## Privacy

- Your API key is stored locally in Chrome's sync storage
- No data is sent to any servers except OpenAI's API
- Video information is extracted from the page and sent to OpenAI for context

## Permissions Explained

- `activeTab`: To access the current YouTube page
- `storage`: To save your API key securely
- `scripting`: To inject the chat interface into YouTube pages
- `https://www.youtube.com/*`: To work specifically on YouTube

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main extension popup interface
- `popup.js` - Popup functionality
- `content.js` - YouTube page integration and chat interface
- `background.js` - Background service worker
- `README.md` - This file

## Development

To modify the extension:
1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Troubleshooting

- **Extension not working**: Make sure you're on a YouTube video page (`youtube.com/watch?v=...`)
- **API errors**: Check that your API key is correct and has credits
- **Chat not opening**: Try refreshing the YouTube page and try again

## License

This project is open source and available under the MIT License.
