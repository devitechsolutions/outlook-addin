# LinkedIn to CRM Sync Chrome Extension

This Chrome extension allows you to extract LinkedIn profile data and sync it with your CRM system.

## Features

- Extract profile information from LinkedIn profiles
- Store extracted data locally
- Sync data with your CRM system (requires CRM API integration)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this extension directory

## Usage

1. Navigate to any LinkedIn profile
2. Click the extension icon in your browser
3. Click "Extract Profile Data" to gather profile information
4. Click "Sync with CRM" to send the data to your CRM system

## CRM Integration

To integrate with your specific CRM:

1. Modify the `syncBtn` click handler in `popup.js`
2. Implement the API calls to your CRM system
3. Handle the response and update the UI accordingly

## Security Note

This extension requires permissions to access LinkedIn profile pages and store data locally. It does not collect or transmit any data without user initiation.