// Context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Create context menus
  chrome.contextMenus.create({
    id: 'saveLinkToSynapse',
    title: 'Save to Synapse',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'saveImageToSynapse',
    title: 'Save Image to Synapse',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'saveSelectionToSynapse',
    title: 'Save to Synapse',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'savePageToSynapse',
    title: 'Save Page to Synapse',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
  const apiUrl = settings.apiUrl || 'http://localhost:3002';
  const apiKey = settings.apiKey;

  if (!apiKey) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Synapse',
      message: 'Please set your API key in extension settings'
    });
    return;
  }

  let input = null;

  switch (info.menuItemId) {
    case 'saveLinkToSynapse':
      input = info.linkUrl;
      break;
    case 'saveImageToSynapse':
      input = info.srcUrl;
      break;
    case 'saveSelectionToSynapse':
      input = info.selectionText;
      break;
    case 'savePageToSynapse':
      input = tab.url;
      break;
  }

  if (input) {
    try {
      const response = await fetch(`${apiUrl}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ input })
      });

      if (response.ok) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Synapse',
          message: 'Saved successfully! 🎉'
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Synapse',
        message: 'Failed to save: ' + error.message
      });
    }
  }
});

// Keyboard shortcut listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      // Trigger context menu save
      chrome.contextMenus.onClicked.addListener({ menuItemId: 'savePageToSynapse' }, tab);
    }
  }
});

