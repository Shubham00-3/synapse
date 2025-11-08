# Synapse Browser Extension - Complete Setup Guide

## Step 1: Create Extension Icons

### Option A: Generate Icons (Easiest)
1. Open `extension/create-icons.html` in your browser
2. Right-click each canvas image
3. Select "Save image as..."
4. Save as:
   - `icon16.png` in `extension/icons/`
   - `icon48.png` in `extension/icons/`
   - `icon128.png` in `extension/icons/`

### Option B: Use Any Images
Just copy any 3 PNG images (16x16, 48x48, 128x128) to `extension/icons/` with those names.

## Step 2: Install Extension in Browser

### Chrome/Edge:
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Toggle **"Developer mode"** ON (top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select: `D:\Synapse\extension`
5. The extension should now appear in your toolbar!

## Step 3: Get Your API Key

You need an API key to let the extension save to your Synapse.

### Method 1: From Your Dashboard (COMING SOON)
We'll add a UI for this in the dashboard, but for now use Method 2.

### Method 2: Using Browser Console
1. Make sure your Synapse server is running:
   ```bash
   cd D:\Synapse
   npm run dev
   ```

2. Open Synapse in browser: `http://localhost:3002`

3. Log in to your account

4. Open Browser Console (Press **F12**)

5. Paste this code and press Enter:
   ```javascript
   fetch('/api/mcp-auth', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include'
   })
   .then(r => r.json())
   .then(data => {
     if (data.apiKey) {
       console.log('✅ Your API Key:', data.apiKey);
       console.log('Copy this key for the extension!');
     } else {
       console.error('❌ Error:', data);
     }
   })
   ```

6. **Copy the API key** that appears (starts with `sk-synapse-...`)

## Step 4: Configure Extension

1. Click the **Synapse extension icon** in your browser toolbar
2. Click **"⚙️ Settings"** button
3. Enter:
   - **Synapse API URL**: `http://localhost:3002` 
     - (Or your deployed URL like `https://synapse-production.up.railway.app`)
   - **API Key**: Paste the key you copied
4. Click **"Save Settings"**

## Step 5: Test It!

### Test 1: Save Current Page
1. Navigate to any article (e.g., Wikipedia)
2. Click the Synapse extension icon
3. Click **"💾 Save This Page"**
4. You should see "Page saved successfully!"
5. Check your Synapse dashboard - the article should appear!

### Test 2: Save Selected Text
1. On any webpage, select some text
2. Click the extension icon
3. Click **"✂️ Save Selected Text"**
4. The text should save as a note!

### Test 3: Right-Click Menu
1. Right-click anywhere on a page
2. Select **"Save Page to Synapse"**
3. You should see a notification!

## Usage Tips

### Popup Actions:
- **Save This Page**: Saves the entire current webpage
- **Save Selected Text**: Saves only highlighted text as a note
- **Save Image**: Saves the first image found on the page

### Context Menu (Right-Click):
- Right-click on **any link** → "Save to Synapse"
- Right-click on **any image** → "Save Image to Synapse"
- **Select text** → right-click → "Save to Synapse"
- Right-click **anywhere** → "Save Page to Synapse"

## Troubleshooting

### "Please set your API key in settings"
- Open extension settings
- Make sure you've entered a valid API key

### "Failed to save: Network error"
- Check that your Synapse server is running
- Verify the API URL is correct
- If deployed, use your Railway URL instead of localhost

### Extension doesn't appear in toolbar
- Go to `chrome://extensions/`
- Make sure the extension is enabled
- Click the puzzle icon (🧩) and pin Synapse

### "Failed to save: 401 Unauthorized"
- Your API key might be invalid
- Generate a new API key and update settings

### Icons not showing
- Make sure `icon16.png`, `icon48.png`, `icon128.png` exist in `extension/icons/`
- Follow Step 1 to create them

## Advanced: Production Deployment

When you deploy Synapse to Railway:

1. Update extension settings:
   - **API URL**: `https://your-app.up.railway.app`
   
2. CORS headers (already configured in your API routes)

3. Your API key works the same way!

## Next Steps

Want to publish the extension?

### Chrome Web Store:
1. Create high-quality icons (hire a designer or use Figma)
2. Take screenshots of the extension in action
3. Write a store listing description
4. Pay $5 one-time developer fee
5. Submit for review at: https://chrome.google.com/webstore/devconsole

### Edge Add-ons:
Same process at: https://partner.microsoft.com/dashboard

### Firefox:
Convert to Firefox format and submit at: https://addons.mozilla.org/developers/

## Support

Issues? Check:
- GitHub: https://github.com/Shubham00-3/synapse
- Or open browser console (F12) to see detailed errors

