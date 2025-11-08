# 🧠 Synapse Browser Extension

Save anything from the web to your personal Synapse second brain with one click!

## ✨ Features

### Quick Save Actions
- **💾 Save Full Pages**: Capture entire articles with metadata, images, and reading time
- **✂️ Save Selected Text**: Turn any text into quick notes
- **🖼️ Save Images**: Store images with OCR and AI analysis
- **🔗 Save Links**: Right-click any link to save it

### Smart Context Menus
Right-click anywhere to:
- Save the current page
- Save links (before clicking them)
- Save images with one click
- Save selected text as notes

### Instant Notifications
Get visual feedback when content is saved successfully.

## 📦 Installation

### Step 1: Create Icons (One-Time Setup)

1. Open `extension/create-icons.html` in your browser
2. Right-click each canvas image
3. Save as PNG in `extension/icons/`:
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)

### Step 2: Install in Browser

**Chrome/Edge/Brave:**
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **"Load unpacked"**
4. Select the `extension` folder
5. Done! Pin the extension to your toolbar

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Select `extension/manifest.json`

### Step 3: Get API Key

**Option 1: Command Line (Easiest)**

```bash
cd D:\Synapse
node scripts/generate-api-key.js your-email@example.com
```

Copy the generated key!

**Option 2: Browser Console**

1. Start your Synapse server: `npm run dev`
2. Open `http://localhost:3002` and log in
3. Open Console (F12)
4. Run:
```javascript
fetch('/api/mcp-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
}).then(r => r.json()).then(d => console.log('API Key:', d.apiKey))
```
5. Copy the generated key

### Step 4: Configure Extension

1. Click the Synapse extension icon
2. Click **"⚙️ Settings"**
3. Enter:
   - **API URL**: `http://localhost:3002` (or your deployed URL)
   - **API Key**: Paste the key from Step 3
4. Click **"Save Settings"**

## 🚀 Usage

### From Extension Popup
Click the extension icon, then:
- **Save This Page**: Saves the current webpage
- **Save Selected Text**: Saves highlighted text
- **Save Image**: Finds and saves first image

### From Context Menu (Right-Click)
- **On any page**: "Save Page to Synapse"
- **On any link**: "Save to Synapse"
- **On any image**: "Save Image to Synapse"
- **On selected text**: "Save to Synapse"

### What Gets Saved?

**Web Pages →** Full article with:
- Title, description, author
- Main content (reader mode)
- Featured image
- Reading time
- AI-generated summary and key points

**Images →** With:
- OCR text extraction
- AI visual analysis
- Searchable tags

**Text →** As notes with:
- Full content
- Timestamp
- Source URL

## 🛠️ Troubleshooting

### "Failed to save: Unauthorized"
- Check that your API key is correct
- Generate a new key if needed
- Make sure you're logged into Synapse

### "Failed to save: Network error"
- Verify Synapse server is running
- Check the API URL in settings
- If deployed, use your production URL

### Extension not showing
- Go to `chrome://extensions/`
- Make sure it's enabled
- Click the puzzle icon (🧩) and pin it

### Icons missing
- Follow Step 1 to create icons
- Make sure all 3 PNG files are in `extension/icons/`

## 🌍 Production Use

When you deploy Synapse to Railway or another host:

1. Update extension settings:
   - **API URL**: `https://your-app.railway.app`
   
2. Keep using the same API key (or generate a new one)

3. That's it! The extension works with any Synapse instance

## 🔒 Privacy & Security

- ✅ Your API key is stored locally in browser sync storage
- ✅ All data goes directly to YOUR Synapse instance
- ✅ No third-party servers involved
- ✅ Open source - review the code yourself!

## 📝 Development

### File Structure
```
extension/
├── manifest.json          # Extension config
├── popup.html/js          # Popup UI
├── background.js          # Background worker
├── content.js             # Page interaction
├── icons/                 # Extension icons
└── README.md              # This file
```

### Testing Locally
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click reload icon on Synapse extension
4. Test your changes

### Publishing (Future)

To publish to Chrome Web Store:
1. Create professional icons and screenshots
2. Write store description
3. Pay $5 developer fee
4. Submit at: https://chrome.google.com/webstore/devconsole

## 🤝 Contributing

Found a bug or want a feature? Open an issue at:
https://github.com/Shubham00-3/synapse

## 📄 License

Same license as Synapse main project.

## 🎉 Enjoy Your Second Brain!

The extension makes it effortless to build your knowledge base. Save anything interesting as you browse, and Synapse will make it searchable and intelligently organized.

Happy browsing! 🧠✨

