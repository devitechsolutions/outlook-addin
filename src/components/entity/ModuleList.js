import React, { Component } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

class ModuleList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabledModules: {},
    };
  }

  componentDidMount() {
    this.loadEnabledModules();
  }

  loadEnabledModules = () => {
    console.log('Loading enabled modules from stored user data...');
    
    // Get enabled modules from authService instead of making API call
    const enabledModules = authService.getEnabledModules();
    console.log('Enabled modules from user data:', enabledModules);
    
    this.setState({
      enabledModules: enabledModules,
      loading: false,
    });
  };

  handleModuleClick = (moduleId, moduleName) => {
    // Use the module key as the module name
    const finalModuleName = moduleId;
    console.log('ModuleList: Selected module:', finalModuleName);
    this.props.onModuleSelect(finalModuleName);
  };

  render() {
    const { loading, enabledModules } = this.state;

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Loading modules..." variant="modern" size="large" />
        </div>
      );
    }

    // enabledModules is an object from the API
    if (typeof enabledModules !== 'object' || enabledModules === null) {
      console.error('ModuleList: enabledModules is not an object:', enabledModules);
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            Error loading modules. Please refresh and try again.
          </p>
        </div>
      );
    }
    
    // Convert object to array of entries for processing
    const moduleEntries = Object.entries(enabledModules);
    
    if (moduleEntries.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            Configure MSOutlook module in the settings
          </p>
        </div>
      );
    }

    // Filter modules where is_create_view_permitted is true
    const creatableModules = moduleEntries.filter(([moduleKey, moduleData]) => 
      moduleData.is_create_view_permitted === true
    );

    if (creatableModules.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            No modules available for creation
          </p>
        </div>
      );
    }

    console.log('ModuleList: Rendering', creatableModules.length, 'creatable modules:', creatableModules);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Create New Record</h2>
          <h2 className="text-base font-semibold text-gray-900">Create New Record</h2>
          <p className="text-xs text-gray-600 mt-1">Select a module to create a new record</p>
          <p className="text-sm text-gray-600 mt-1">Select a module to create a new record</p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-3">
            {creatableModules.map(([moduleKey, moduleData], index) => {
              // Extract module information from the API response  
              const moduleId = moduleKey; // Use the key as the module ID
              const displayName = moduleData.display_name || moduleData.label || moduleKey;
              
              console.log(`ModuleList: Rendering module ${index + 1}:`, { moduleId, displayName });
              
              return (
                <button
                  key={moduleKey}
                  className="w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onClick={() => this.handleModuleClick(moduleId, displayName)}
                >
                  <PlusIcon className="w-3 h-3 mr-2" />
                  Create New {displayName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ModuleList;