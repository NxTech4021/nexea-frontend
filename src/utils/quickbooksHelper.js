/**
 * QuickBooks Integration Helper Utilities
 * 
 * This module provides production-ready utilities for managing QuickBooks OAuth integration,
 * including handling company switching, session management, and browser compatibility.
 */

/**
 * Configuration for QuickBooks OAuth behavior
 */
const QB_CONFIG = {
  // Popup window dimensions
  POPUP_WIDTH: 600,
  POPUP_HEIGHT: 700,
  
  // Timeout settings (in milliseconds)
  CONNECTION_TIMEOUT: 300000, // 5 minutes
  SWITCH_COMPANY_TIMEOUT: 300000, // 5 minutes
  
  // Session management
  SESSION_CHECK_INTERVAL: 1000, // Check every second
  
  // URLs (these should match your backend routes)
  CONNECT_URL: '/api/quickbooks/connect',
  SWITCH_COMPANY_URL: '/api/quickbooks/switch-company',
  STATUS_URL: '/api/quickbooks/status',
  DISCONNECT_URL: '/api/quickbooks/disconnect'
};

/**
 * Creates and manages a popup window for QuickBooks OAuth
 * @param {string} url - The OAuth URL to open
 * @param {string} title - Window title
 * @param {number} width - Window width
 * @param {number} height - Window height
 * @returns {Window} The popup window reference
 */
function createOAuthPopup(url, title = 'QuickBooks Authorization', width = QB_CONFIG.POPUP_WIDTH, height = QB_CONFIG.POPUP_HEIGHT) {
  // Calculate center position
  const left = (window.screen.width / 2) - (width / 2);
  const top = (window.screen.height / 2) - (height / 2);
  
  const popup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );
  
  if (!popup) {
    throw new Error('Popup blocked. Please allow popups for this site and try again.');
  }
  
  return popup;
}

/**
 * Monitors a popup window and resolves when it closes or receives a message
 * @param {Window} popup - The popup window to monitor
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Promise that resolves with the result or rejects on timeout/error
 */
function monitorPopup(popup, timeout = QB_CONFIG.CONNECTION_TIMEOUT) {
  return new Promise((resolve, reject) => {
    let timeoutId;
    let intervalId;
    
    // Set up timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('QuickBooks authorization timed out. Please try again.'));
    }, timeout);
    
    // Listen for messages from the popup
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) {
        return; // Ignore messages from other origins
      }
      
      if (event.data && (event.data.type === 'QUICKBOOKS_CONNECTED' || event.data.type === 'QUICKBOOKS_COMPANY_SWITCHED')) {
        cleanup();
        resolve({
          success: true,
          type: event.data.type,
          realmId: event.data.realmId,
          isSwitchCompany: event.data.isSwitchCompany || false,
          timestamp: event.data.timestamp
        });
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Check if popup is closed
    intervalId = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('QuickBooks authorization was cancelled by user.'));
      }
    }, QB_CONFIG.SESSION_CHECK_INTERVAL);
    
    function cleanup() {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('message', messageHandler);
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  });
}

/**
 * Displays a user-friendly notification about browser session behavior
 * @param {boolean} isSwitch - Whether this is for company switching
 */
function showSessionInfo(isSwitch = false) {
  const message = isSwitch 
    ? 'If you were automatically logged in without choosing a company, this is normal behavior. QuickBooks remembers your login. To force company selection, try using an incognito/private browser window.'
    : 'QuickBooks will remember your login for convenience. If you need to connect to a different company later, use the "Switch Company" option.';
    
  // You can customize this notification system based on your UI framework
  console.info(`ℹ️ QuickBooks Session Info: ${message}`);
  
  // Example toast notification (customize based on your notification system)
  if (window.showToast) {
    window.showToast({
      type: 'info',
      title: `QuickBooks ${isSwitch ? 'Company Switch' : 'Connection'}`,
      message: message,
      duration: 10000 // 10 seconds
    });
  }
}

/**
 * Checks current QuickBooks connection status
 * @returns {Promise<Object>} Connection status object
 */
async function checkQuickBooksStatus() {
  try {
    const response = await fetch(QB_CONFIG.STATUS_URL, {
      method: 'GET',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking QuickBooks status:', error);
    throw new Error('Failed to check QuickBooks connection status');
  }
}

/**
 * Initiates QuickBooks connection with enhanced error handling
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Connection result
 */
async function connectToQuickBooks(options = {}) {
  const {
    showSessionNotification = true,
    timeout = QB_CONFIG.CONNECTION_TIMEOUT,
    onProgress = null
  } = options;
  
  try {
    if (onProgress) onProgress('Initiating QuickBooks connection...');
    
    // Show session info if requested
    if (showSessionNotification) {
      showSessionInfo(false);
    }
    
    // Create and monitor popup
    const popup = createOAuthPopup(QB_CONFIG.CONNECT_URL, 'Connect to QuickBooks');
    
    if (onProgress) onProgress('Waiting for authorization...');
    
    const result = await monitorPopup(popup, timeout);
    
    if (onProgress) onProgress('Connection successful!');
    
    return result;
  } catch (error) {
    console.error('QuickBooks connection error:', error);
    throw error;
  }
}

/**
 * Initiates QuickBooks company switching with comprehensive session handling
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Switch result
 */
async function switchQuickBooksCompany(options = {}) {
  const {
    showSessionNotification = true,
    timeout = QB_CONFIG.SWITCH_COMPANY_TIMEOUT,
    onProgress = null,
    forceLogout = false
  } = options;
  
  try {
    if (onProgress) onProgress('Preparing to switch QuickBooks company...');
    
    // Show session info if requested
    if (showSessionNotification) {
      showSessionInfo(true);
    }
    
    // If forceLogout is requested, provide instructions
    if (forceLogout) {
      const shouldProceed = window.confirm(
        'To ensure you can select a different company, you may want to:\n\n' +
        '1. Log out of QuickBooks in another tab first, OR\n' +
        '2. Use an incognito/private browser window, OR\n' +
        '3. Clear your browser cookies for QuickBooks\n\n' +
        'Would you like to proceed with company switching?'
      );
      
      if (!shouldProceed) {
        throw new Error('Company switch cancelled by user');
      }
    }
    
    if (onProgress) onProgress('Opening QuickBooks company selection...');
    
    // Create and monitor popup for company switching
    const popup = createOAuthPopup(QB_CONFIG.SWITCH_COMPANY_URL, 'Switch QuickBooks Company');
    
    if (onProgress) onProgress('Waiting for company selection...');
    
    const result = await monitorPopup(popup, timeout);
    
    if (onProgress) onProgress('Company switch successful!');
    
    return result;
  } catch (error) {
    console.error('QuickBooks company switch error:', error);
    throw error;
  }
}

/**
 * Disconnects from QuickBooks
 * @returns {Promise<Object>} Disconnect result
 */
async function disconnectFromQuickBooks() {
  try {
    const response = await fetch(QB_CONFIG.DISCONNECT_URL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('QuickBooks disconnect error:', error);
    throw new Error('Failed to disconnect from QuickBooks');
  }
}

/**
 * Provides instructions for manual session clearing
 * @returns {string} HTML formatted instructions
 */
function getSessionClearingInstructions() {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">
      <h3>🔄 Force Fresh QuickBooks Authorization</h3>
      <p>If QuickBooks automatically logs you in without showing company selection, try one of these methods:</p>
      
      <h4>Method 1: Use Incognito/Private Mode</h4>
      <ul>
        <li><strong>Chrome:</strong> Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)</li>
        <li><strong>Firefox:</strong> Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)</li>
        <li><strong>Safari:</strong> Cmd+Shift+N</li>
        <li><strong>Edge:</strong> Ctrl+Shift+N</li>
      </ul>
      
      <h4>Method 2: Clear QuickBooks Session</h4>
      <ol>
        <li>Go to <a href="https://accounts.intuit.com" target="_blank">https://accounts.intuit.com</a></li>
        <li>Sign out of your QuickBooks account</li>
        <li>Return to this page and try switching companies again</li>
      </ol>
      
      <h4>Method 3: Clear Browser Data</h4>
      <ol>
        <li>Open browser settings</li>
        <li>Find "Clear browsing data" or "Privacy and security"</li>
        <li>Clear cookies and site data for QuickBooks domains</li>
        <li>Refresh this page and try again</li>
      </ol>
    </div>
  `;
}

/**
 * Advanced company switching with user guidance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Switch result with user guidance
 */
async function advancedCompanySwitching(options = {}) {
  const {
    showInstructions = true,
    onProgress = null
  } = options;
  
  try {
    // Check current status first
    if (onProgress) onProgress('Checking current QuickBooks connection...');
    
    const currentStatus = await checkQuickBooksStatus();
    
    if (!currentStatus.connected) {
      throw new Error('Not currently connected to QuickBooks. Please connect first.');
    }
    
    // Show instructions if requested
    if (showInstructions) {
      const showInstructionsDialog = window.confirm(
        'QuickBooks Company Switching\n\n' +
        'Due to browser session persistence, QuickBooks might automatically log you into the same company. ' +
        'Would you like to see instructions for forcing a fresh authorization?\n\n' +
        'Click "OK" to see instructions, or "Cancel" to proceed with normal switching.'
      );
      
      if (showInstructionsDialog) {
        // You can customize this based on your modal/dialog system
        if (window.showModal) {
          window.showModal({
            title: 'QuickBooks Company Switching Instructions',
            content: getSessionClearingInstructions(),
            type: 'info'
          });
        } else {
          // Fallback: open in new window
          const instructionWindow = window.open('', 'QB_Instructions', 'width=600,height=500');
          instructionWindow.document.write(`
            <html>
              <head><title>QuickBooks Company Switching Instructions</title></head>
              <body style="padding: 20px;">${getSessionClearingInstructions()}</body>
            </html>
          `);
        }
        
        const shouldProceed = window.confirm('Would you like to proceed with company switching now?');
        if (!shouldProceed) {
          return { success: false, cancelled: true, message: 'Company switching cancelled by user' };
        }
      }
    }
    
    // Proceed with company switching
    return await switchQuickBooksCompany({
      showSessionNotification: false, // We already showed instructions
      onProgress
    });
    
  } catch (error) {
    console.error('Advanced company switching error:', error);
    throw error;
  }
}

/**
 * Utility to detect if running in incognito/private mode
 * @returns {Promise<boolean>} True if in incognito mode
 */
async function isIncognitoMode() {
  try {
    // Try to detect incognito mode (this is not 100% reliable across all browsers)
    if ('webkitRequestFileSystem' in window) {
      // Chrome/Edge detection
      return new Promise((resolve) => {
        webkitRequestFileSystem(
          window.TEMPORARY,
          1,
          () => resolve(false),
          () => resolve(true)
        );
      });
    } else if ('MozAppearance' in document.documentElement.style) {
      // Firefox detection (less reliable)
      return Promise.resolve(false); // Cannot reliably detect in Firefox
    } else {
      // Other browsers
      return Promise.resolve(false);
    }
  } catch (error) {
    console.warn('Could not detect incognito mode:', error);
    return Promise.resolve(false);
  }
}

// Export all utilities
const QuickBooksHelper = {
  // Core functions
  connectToQuickBooks,
  switchQuickBooksCompany,
  disconnectFromQuickBooks,
  checkQuickBooksStatus,
  
  // Advanced functions
  advancedCompanySwitching,
  
  // Utility functions
  createOAuthPopup,
  monitorPopup,
  showSessionInfo,
  getSessionClearingInstructions,
  isIncognitoMode,
  
  // Configuration
  config: QB_CONFIG
};

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickBooksHelper;
}

// For ES6 modules
export default QuickBooksHelper;

// For global usage
if (typeof window !== 'undefined') {
  window.QuickBooksHelper = QuickBooksHelper;
}
