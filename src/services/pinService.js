class PinService {
  constructor() {
    this.isPinned = false;
    this.listeners = [];
    this.isInitialized = false;
    this.activityInterval = null;
    this.loadPinState();
  }

  // Subscribe to pin state changes
  subscribe(callback) {
    console.log('PinService: New subscriber added');
    this.listeners.push(callback);
    
    // Call callback immediately with current state
    setTimeout(() => callback(this.isPinned), 0);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of pin state changes
  notifyListeners() {
    console.log('PinService: Notifying', this.listeners.length, 'listeners with pin state:', this.isPinned);
    this.listeners.forEach((callback, index) => {
      try {
        callback(this.isPinned);
      } catch (error) {
        console.error(`PinService: Error calling listener ${index + 1}:`, error);
      }
    });
  }

  // Load pin state from storage
  loadPinState() {
    try {
      const savedPinState = localStorage.getItem('outlook-addin-pinned');
      this.isPinned = savedPinState === 'true';
      console.log('PinService: Loaded pin state:', this.isPinned);
      
      if (this.isPinned) {
        this.enablePinMode();
      }
    } catch (error) {
      console.error('PinService: Error loading pin state:', error);
      this.isPinned = false;
    }
  }

  // Save pin state to storage
  savePinState() {
    try {
      localStorage.setItem('outlook-addin-pinned', this.isPinned.toString());
      console.log('PinService: Saved pin state:', this.isPinned);
    } catch (error) {
      console.error('PinService: Error saving pin state:', error);
    }
  }

  // Get current pin state
  getPinState() {
    return this.isPinned;
  }

  // Set pin state
  setPinState(isPinned) {
    if (this.isPinned !== isPinned) {
      this.isPinned = isPinned;
      this.savePinState();
      
      if (isPinned) {
        this.enablePinMode();
      } else {
        this.disablePinMode();
      }
      
      this.notifyListeners();
    }
  }

  // Toggle pin state
  togglePin() {
    this.setPinState(!this.isPinned);
    return this.isPinned;
  }

  // Enable pin mode
  enablePinMode() {
    console.log('PinService: Enabling pin mode');
    
    try {
      // Add visual indicators
      this.addVisualIndicators();
      
      // Start activity maintenance
      this.startActivityMaintenance();
      
      // Add Office.js event handlers if available
      this.addOfficeEventHandlers();
      
      // Add browser event handlers
      this.addBrowserEventHandlers();
      
    } catch (error) {
      console.error('PinService: Error enabling pin mode:', error);
    }
  }

  // Disable pin mode
  disablePinMode() {
    console.log('PinService: Disabling pin mode');
    
    try {
      this.removeVisualIndicators();
      this.stopActivityMaintenance();
      this.removeEventHandlers();
    } catch (error) {
      console.error('PinService: Error disabling pin mode:', error);
    }
  }

  // Add visual indicators
  addVisualIndicators() {
    try {
      // Add pin indicator to title
      if (document.title && !document.title.includes('📌')) {
        document.title = '📌 ' + document.title;
      }

      // Add body class for styling
      document.body.classList.add('addin-pinned');

      console.log('PinService: Visual indicators added');
    } catch (error) {
      console.warn('PinService: Error adding visual indicators:', error);
    }
  }

  // Remove visual indicators
  removeVisualIndicators() {
    try {
      // Remove pin indicator from title
      if (document.title && document.title.includes('📌')) {
        document.title = document.title.replace('📌 ', '');
      }

      // Remove body class
      document.body.classList.remove('addin-pinned');

      console.log('PinService: Visual indicators removed');
    } catch (error) {
      console.warn('PinService: Error removing visual indicators:', error);
    }
  }

  // Start activity maintenance
  startActivityMaintenance() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }

    // Maintain activity every 5 seconds (less aggressive)
    this.activityInterval = setInterval(() => {
      if (this.isPinned) {
        try {
          // Update activity timestamp
          const timestamp = Date.now();
          document.body.setAttribute('data-pin-timestamp', timestamp.toString());
          
          // Dispatch custom event to maintain activity
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('pin-activity', {
              detail: { timestamp }
            }));
          }
          
          console.log('PinService: Activity maintained at', new Date(timestamp).toLocaleTimeString());
        } catch (error) {
          console.warn('PinService: Error in activity maintenance:', error);
        }
      }
    }, 5000);
  }

  // Stop activity maintenance
  stopActivityMaintenance() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
      console.log('PinService: Activity maintenance stopped');
    }
  }

  // Add Office.js event handlers
  addOfficeEventHandlers() {
    if (typeof Office === 'undefined' || !Office.context) {
      console.log('PinService: Office.js not available, skipping Office event handlers');
      return;
    }

    try {
      // Add item changed handler for email switches
      if (Office.context.mailbox && Office.context.mailbox.addHandlerAsync) {
        Office.context.mailbox.addHandlerAsync(
          Office.EventType.ItemChanged,
          (args) => {
            console.log('PinService: Email item changed, maintaining pin state');
            this.maintainPinState();
          },
          (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              console.log('PinService: Item changed handler added successfully');
            } else {
              console.warn('PinService: Failed to add item changed handler:', result.error);
            }
          }
        );
      }
    } catch (error) {
      console.warn('PinService: Error adding Office.js event handlers:', error);
    }
  }

  // Add browser event handlers
  addBrowserEventHandlers() {
    if (typeof window === 'undefined') return;

    try {
      // Handle visibility changes
      const handleVisibilityChange = () => {
        if (this.isPinned && document.hidden) {
          console.log('PinService: Document hidden, attempting to maintain visibility');
          setTimeout(() => {
            this.maintainPinState();
          }, 100);
        }
      };

      // Handle before unload
      const handleBeforeUnload = (event) => {
        if (this.isPinned) {
          console.log('PinService: Preventing unload due to pin state');
          // Don't show confirmation dialog, just log
          return undefined;
        }
      };

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Store for cleanup
      this.eventListeners = [
        { element: document, event: 'visibilitychange', handler: handleVisibilityChange },
        { element: window, event: 'beforeunload', handler: handleBeforeUnload }
      ];

      console.log('PinService: Browser event handlers added');
    } catch (error) {
      console.warn('PinService: Error adding browser event handlers:', error);
    }
  }

  // Remove event handlers
  removeEventHandlers() {
    try {
      // Remove Office.js handlers
      if (typeof Office !== 'undefined' && Office.context && Office.context.mailbox && Office.context.mailbox.removeHandlerAsync) {
        Office.context.mailbox.removeHandlerAsync(
          Office.EventType.ItemChanged,
          () => {},
          () => console.log('PinService: Item changed handler removed')
        );
      }

      // Remove browser event listeners
      if (this.eventListeners) {
        this.eventListeners.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
      }

      console.log('PinService: Event handlers removed');
    } catch (error) {
      console.warn('PinService: Error removing event handlers:', error);
    }
  }

  // Maintain pin state
  maintainPinState() {
    if (!this.isPinned) return;

    try {
      console.log('PinService: Maintaining pin state');
      
      // Update timestamp
      const timestamp = Date.now();
      document.body.setAttribute('data-pin-maintained', timestamp.toString());
      
      // Dispatch maintenance event
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('pin-maintained', {
          detail: { timestamp }
        }));
      }
      
      // Try to maintain focus (non-aggressive)
      if (window && window.focus && !document.hidden) {
        setTimeout(() => {
          try {
            window.focus();
          } catch (e) {
            // Ignore focus errors
          }
        }, 50);
      }
    } catch (error) {
      console.warn('PinService: Error maintaining pin state:', error);
    }
  }

  // Check if pinning is supported
  isPinningSupported() {
    return !!(
      (typeof window !== 'undefined' && window.addEventListener) ||
      (Office && Office.context)
    );
  }

  // Get pin statistics
  getPinStats() {
    return {
      isPinned: this.isPinned,
      listenersCount: this.listeners.length,
      eventListenersCount: this.eventListeners?.length || 0,
      isSupported: this.isPinningSupported(),
      hasActivityInterval: !!this.activityInterval,
    };
  }
}

// Create singleton instance
const pinService = new PinService();

export default pinService;