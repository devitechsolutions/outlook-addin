import React, { Component } from 'react';
import { 
  MapPinIcon as PinIcon,
} from '@heroicons/react/24/outline';
import { 
  MapPinIcon as PinIconSolid,
} from '@heroicons/react/24/solid';

class PinButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPinned: false,
      isSupported: false,
    };
  }

  componentDidMount() {
    this.checkPinSupport();
    this.loadPinState();
  }

  checkPinSupport = () => {
    // Check if the Office.js API supports pinning
    const isSupported = !!(
      Office.context &&
      Office.context.ui &&
      Office.context.ui.pinDisplayLanguage !== undefined
    );
    
    console.log('PinButton: Pin support available:', isSupported);
    this.setState({ isSupported });
  };

  loadPinState = () => {
    // Load pin state from local storage
    try {
      const savedPinState = localStorage.getItem('outlook-addin-pinned');
      const isPinned = savedPinState === 'true';
      console.log('PinButton: Loaded pin state:', isPinned);
      this.setState({ isPinned });
    } catch (error) {
      console.error('PinButton: Error loading pin state:', error);
    }
  };

  savePinState = (isPinned) => {
    try {
      localStorage.setItem('outlook-addin-pinned', isPinned.toString());
      console.log('PinButton: Saved pin state:', isPinned);
    } catch (error) {
      console.error('PinButton: Error saving pin state:', error);
    }
  };

  togglePin = async () => {
    const { isPinned } = this.state;
    const newPinState = !isPinned;

    try {
      if (newPinState) {
        // Pin the taskpane
        await this.pinTaskpane();
      } else {
        // Unpin the taskpane
        await this.unpinTaskpane();
      }

      this.setState({ isPinned: newPinState });
      this.savePinState(newPinState);
      
      // Call callback if provided
      if (this.props.onPinChange) {
        this.props.onPinChange(newPinState);
      }

      console.log('PinButton: Pin state changed to:', newPinState);
    } catch (error) {
      console.error('PinButton: Error toggling pin:', error);
    }
  };

  pinTaskpane = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Simple approach - just update state
        console.log('PinButton: Pinning taskpane');
        
        // Show user feedback
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('pin-activated', {
            detail: { message: 'Add-in pinned - it will try to stay visible when switching emails' }
          }));
        }
        
        resolve();
      } catch (error) {
        console.error('PinButton: Error in pinTaskpane:', error);
        resolve();
      }
    });
  };

  unpinTaskpane = async () => {
    return new Promise((resolve) => {
      try {
        // Simple approach - just update state
        console.log('PinButton: Unpinning taskpane');
        resolve();
      } catch (error) {
        console.error('PinButton: Error in unpinTaskpane:', error);
        resolve();
      }
    });
  };

  componentDidUpdate(prevProps, prevState) {
    // Update pin service when state changes
    if (prevState.isPinned !== this.state.isPinned) {
      try {
        const pinService = require('../../services/pinService').default;
        pinService.setPinState(this.state.isPinned);
      } catch (error) {
        console.error('PinButton: Error updating pin service:', error);
      }
    }
  }

  render() {
    const { isPinned, isSupported } = this.state;
    const { className = '', size = 'medium', showLabel = false } = this.props;

    // Don't render if not supported and no fallback needed
    if (!isSupported && !this.props.showAlways) {
      return null;
    }

    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
    };

    const buttonSizeClasses = {
      small: 'p-1',
      medium: 'p-1.5',
      large: 'p-2',
    };

    const IconComponent = isPinned ? PinIconSolid : PinIcon;

    return (
      <button
        onClick={this.togglePin}
        className={`${buttonSizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${className}`}
        title={isPinned ? 'Unpin plugin' : 'Pin plugin to keep it open'}
        type="button"
      >
        <div className="flex items-center">
          <IconComponent 
            className={`${sizeClasses[size]} ${isPinned ? 'text-primary-600' : 'text-gray-500'} transition-colors`} 
          />
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {isPinned ? 'Unpin' : 'Pin'}
            </span>
          )}
        </div>
      </button>
    );
  }
}

export default PinButton;