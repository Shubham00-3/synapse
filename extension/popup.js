// Load current page info
let currentTab = null;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    currentTab = tabs[0];
    document.getElementById('pageTitle').textContent = tabs[0].title || 'Untitled';
    document.getElementById('pageUrl').textContent = tabs[0].url || '';
  }
});

// Load settings
chrome.storage.sync.get(['apiUrl', 'apiKey'], (data) => {
  document.getElementById('apiUrl').value = data.apiUrl || 'http://localhost:3002';
  document.getElementById('apiKey').value = data.apiKey || '';
});

// Settings toggle
document.getElementById('settingsBtn').addEventListener('click', () => {
  const settings = document.getElementById('settings');
  settings.classList.toggle('show');
});

// Save settings
document.getElementById('saveSettings').addEventListener('click', () => {
  const apiUrl = document.getElementById('apiUrl').value;
  const apiKey = document.getElementById('apiKey').value;

  chrome.storage.sync.set({ apiUrl, apiKey }, () => {
    showStatus('Settings saved!', 'success');
    document.getElementById('settings').classList.remove('show');
  });
});

// Save current page
document.getElementById('savePage').addEventListener('click', async () => {
  if (!currentTab) return;
  
  showLoading(true);
  
  try {
    await saveToSynapse(currentTab.url);
    showStatus('Page saved successfully!', 'success');
  } catch (error) {
    showStatus('Failed to save: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
});

// Save selected text
document.getElementById('saveSelection').addEventListener('click', async () => {
  showLoading(true);
  
  try {
    // Get selected text from page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString()
    });
    
    const selectedText = results[0].result;
    
    if (!selectedText || selectedText.trim() === '') {
      throw new Error('No text selected');
    }
    
    await saveToSynapse(selectedText);
    showStatus('Selection saved!', 'success');
  } catch (error) {
    showStatus('Failed to save: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
});

// Save image (finds first image on page)
document.getElementById('saveImage').addEventListener('click', async () => {
  showLoading(true);
  
  try {
    // Get first image from page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const img = document.querySelector('img[src]');
        return img ? img.src : null;
      }
    });
    
    const imageUrl = results[0].result;
    
    if (!imageUrl) {
      throw new Error('No image found on page');
    }
    
    await saveToSynapse(imageUrl);
    showStatus('Image saved!', 'success');
  } catch (error) {
    showStatus('Failed to save: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
});

// Save to Synapse API
async function saveToSynapse(input) {
  const settings = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
  const apiUrl = settings.apiUrl || 'http://localhost:3002';
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new Error('Please set your API key in settings');
  }

  const response = await fetch(`${apiUrl}/api/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ input })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save');
  }

  return await response.json();
}

// UI helpers
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.querySelector('.actions').style.display = show ? 'none' : 'flex';
}

