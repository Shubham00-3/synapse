# Synapse Browser Extension

Save content to your Synapse second brain with one click!

## Features

- 💾 **Save any webpage** with one click
- ✂️ **Save selected text** as notes
- 🖼️ **Save images** from any page
- 🎯 **Right-click context menus** for quick saving
- ⌨️ **Keyboard shortcuts** for power users
- 🔐 **Secure** - uses your personal API key

## Installation

### For Development/Local Use:

1. **Build the icons** (or use placeholder icons):
   - Create `extension/icons/` folder
   - Add 3 icon files: `icon16.png`, `icon48.png`, `icon128.png`
   - Or use any 16x16, 48x48, and 128x128 PNG images

2. **Load in Chrome/Edge**:
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` folder from your Synapse project

3. **Configure**:
   - Click the extension icon
   - Click "Settings"
   - Enter your Synapse API URL: `http://localhost:3002` (or your deployed URL)
   - Enter your API key (generate one from your Synapse dashboard)
   - Click "Save Settings"

### For Chrome Web Store (Future):

To publish:
1. Create proper icons
2. Add screenshots
3. Write store description
4. Submit to Chrome Web Store

## Usage

### Popup (Click Extension Icon):
- **Save This Page**: Saves the current webpage
- **Save Selected Text**: Saves highlighted text
- **Save Image**: Saves the first image on the page

### Right-Click Context Menu:
- Right-click any link → "Save to Synapse"
- Right-click any image → "Save Image to Synapse"
- Select text → right-click → "Save to Synapse"

### From Any Page:
- Just right-click → "Save Page to Synapse"

## Getting Your API Key

1. Open your Synapse dashboard
2. Open browser console (F12)
3. Run:
   ```javascript
   fetch('/api/mcp-auth', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: 'Browser Extension' })
   })
   .then(r => r.json())
   .then(d => console.log('API Key:', d.apiKey))
   ```
4. Copy the API key that appears

## Privacy

- All data stays between your browser and your Synapse instance
- No data is sent to third parties
- Your API key is stored securely in Chrome's sync storage

## Troubleshooting

**"Failed to save"**:
- Make sure your Synapse server is running
- Check that the API URL is correct
- Verify your API key is valid

**"Please set your API key"**:
- Open extension settings
- Generate and enter an API key

**Extension not appearing**:
- Make sure Developer mode is enabled
- Reload the extension from `chrome://extensions/`

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `popup.html/js` - Popup interface
- `background.js` - Background service worker
- `content.js` - Page interaction script

## Support

For issues, visit: https://github.com/Shubham00-3/synapse

