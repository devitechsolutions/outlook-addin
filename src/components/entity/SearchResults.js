import React, { Component } from 'react';
import { EyeIcon, PencilIcon, ArrowPathIcon, UserIcon, EnvelopeIcon, ArchiveBoxIcon, LinkIcon, ExclamationTriangleIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import CreateMode from './CreateMode';
import ModuleList from './ModuleList';
import outlookService from '../../services/outlookService';
import apiService from '../../services/apiService';
import storageService from '../../services/storageService';
import authService from '../../services/authService';
import ShowHeadFields from './ShowHeadFields';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreateMode: false,
      archivingToRecord: null,
      showLinkEmailDialog: false,
      linkEmailLoading: false,
      enabledModules: {},
      selectedModule: '',
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchTimeout: null,
    };
  }

  componentDidMount() {
    this.loadEnabledModules();
  }

  loadEnabledModules = () => {
    console.log('SearchResults: Loading enabled modules from stored user data...');
    
    // Get enabled modules from authService
    const enabledModules = authService.getEnabledModules();
    console.log('SearchResults: Enabled modules from user data:', enabledModules);
    
    this.setState({
      enabledModules: enabledModules,
    });
  };

  handleArchiveEmail = async (record) => {
    try {
      this.setState({ archivingToRecord: record.crmid });

      const user = await storageService.getUser();
      
      console.log('SearchResults: Starting email archive process...');
      console.log('SearchResults: Parent record ID:', record.crmid);
      console.log('SearchResults: Current user ID:', user.userid);
      
      // Validate Office.js context before proceeding
      if (!Office.context || !Office.context.mailbox || !Office.context.mailbox.item) {
        throw new Error('Office.js context not available. Please refresh the add-in.');
      }
      
      // Get complete email data including attachments, CC, BCC, etc.
      const completeEmailData = await outlookService.createCompleteEmailArchiveData(
        record.crmid,
        user.userid
      );

      console.log('SearchResults: Complete email data prepared for:', record.label);

      const result = await apiService.archiveEmail(completeEmailData);

      if (result.success) {
        const attachmentText = completeEmailData.hasAttachments 
          ? ` with ${completeEmailData.attachments.length} attachment(s)` 
          : '';
        
        toast.success(`Email archived successfully to ${record.label}${attachmentText}`, {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
        
        console.log('SearchResults: Email archived successfully');
      } else if (result.needsLogout && this.props.onLogout) {
        console.log('SearchResults: Session expired during email archive');
        this.props.onLogout();
      } else {
        console.error('SearchResults: Email archive failed:', result.error);
        toast.error(result.error || 'Failed to archive email', {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
      }
    } catch (error) {
      console.error('Error archiving email:', error);
      
      let errorMessage = 'Failed to archive email. ';
      if (error.message.includes('attachment')) {
        errorMessage += 'There was an issue processing email attachments.';
      } else if (error.message.includes('permission')) {
        errorMessage += 'Permission denied. Please check your email access rights.';
      } else if (error.message.includes('Office.js context')) {
        errorMessage += 'Add-in context lost. Please refresh the add-in.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      toast.error(errorMessage, {
        closeOnClick: true,
        pauseOnHover: true,
        theme: 'colored',
        autoClose: 7000,
      });
    } finally {
      this.setState({ archivingToRecord: null });
    }
  };

  handleLinkEmailWithRecord = async (selectedRecord) => {
    try {
      this.setState({ linkEmailLoading: true });

      const user = await storageService.getUser();
      
      console.log('SearchResults: Starting email linking process...');
      console.log('SearchResults: Target record ID:', selectedRecord.crmid);
      console.log('SearchResults: Current user ID:', user.userid);
      
      // Validate Office.js context before proceeding
      if (!Office.context || !Office.context.mailbox || !Office.context.mailbox.item) {
        throw new Error('Office.js context not available. Please refresh the add-in.');
      }
      
      // Get complete email data for linking
      const completeEmailData = await outlookService.createCompleteEmailArchiveData(
        selectedRecord.crmid,
        user.userid
      );

      console.log('SearchResults: Email data prepared for linking:', {
        subject: completeEmailData.subject,
        targetRecord: selectedRecord.label,
        targetModule: selectedRecord.module
      });

      const result = await apiService.archiveEmail(completeEmailData);

      if (result.success) {
        toast.success(`Email linked successfully with ${selectedRecord.label}`, {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
        
        console.log('SearchResults: Email linked successfully');
        this.setState({ 
          showLinkEmailDialog: false,
          selectedModule: '',
          searchQuery: '',
          searchResults: []
        });
      } else if (result.needsLogout && this.props.onLogout) {
        console.log('SearchResults: Session expired during email linking');
        this.props.onLogout();
      } else {
        console.error('SearchResults: Email linking failed:', result.error);
        toast.error(result.error || 'Failed to link email', {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
      }
    } catch (error) {
      console.error('Error linking email:', error);
      
      let errorMessage = 'Failed to link email. ';
      if (error.message.includes('Office.js context')) {
        errorMessage += 'Add-in context lost. Please refresh the add-in.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      toast.error(errorMessage, {
        closeOnClick: true,
        pauseOnHover: true,
        theme: 'colored',
        autoClose: 7000,
      });
    } finally {
      this.setState({ linkEmailLoading: false });
    }
  };

  handleModuleChange = (e) => {
    const module = e.target.value;
    this.setState({
      selectedModule: module,
      searchQuery: '',
      searchResults: []
    });
  };

  handleSearchInputChange = (e) => {
    const query = e.target.value;
    this.setState({ searchQuery: query });

    // Clear existing timeout
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }

    // Clear results if query is too short
    if (query.length < 2) {
      this.setState({ searchResults: [] });
      return;
    }

    // Set new timeout for search
    if (this.state.selectedModule) {
      const timeout = setTimeout(() => {
        this.performSearch(query);
      }, 300); // 300ms debounce
      this.setState({ searchTimeout: timeout });
    }
  };

  performSearch = async (query) => {
    if (!this.state.selectedModule || !query || query.length < 2) {
      return;
    }

    this.setState({ searchLoading: true });

    try {
      console.log(`SearchResults: Searching in module ${this.state.selectedModule} for: ${query}`);
      
      const result = await apiService.searchRecords(this.state.selectedModule, query);

      if (result.success) {
        const searchData = result.data.data || result.data.records || result.data || [];
        console.log(`SearchResults: Found ${searchData.length} records`);
        
        // Process the search results to ensure they have the right structure
        const processedResults = Array.isArray(searchData) ? searchData.map(record => ({
          ...record,
          crmid: record.id || record.crmid,
          label: record.label || record.name || 'Unnamed Record',
          module: this.state.selectedModule
        })) : [];
        
        console.log(`SearchResults: Processed ${processedResults.length} search results:`, processedResults);
        this.setState({ searchResults: processedResults });
      } else {
        console.warn('SearchResults: Search failed:', result.error);
        this.setState({ searchResults: [] });
      }
    } catch (error) {
      console.error('Error performing search:', error);
      this.setState({ searchResults: [] });
    } finally {
      this.setState({ searchLoading: false });
    }
  };

  handleRecordClick = (record) => {
    // Don't automatically open detail view - let users choose via action buttons
    console.log('Record clicked:', record.label);
  };

  handleEditClick = (e, record) => {
    e.stopPropagation();
    this.props.onRecordSelect(record);
  };

  handleCreateRecord = (moduleKey) => {
    console.log('Creating new record for module:', moduleKey);
    this.setState({ 
      showCreateMode: true,
      preSelectedModule: moduleKey
    });
  };
  render() {
    const { results } = this.props;
    const { 
      showCreateMode, 
      archivingToRecord, 
      showLinkEmailDialog,
      linkEmailLoading,
      enabledModules,
      selectedModule,
      searchQuery,
      searchResults,
      searchLoading
    } = this.state;
    const totalCount = results.length;
    
    // Get email info for create mode
    const { firstname, lastname } = outlookService.parseDisplayName();
    const fromEmail = outlookService.getFromEmail();

    // Convert enabled modules to array for dropdown
    const moduleOptions = Object.entries(enabledModules).map(([key, moduleData]) => ({
      value: key,
      label: moduleData.display_name || moduleData.label || key
    }));

    if (showCreateMode) {
      return (
        <CreateMode
          preSelectedModule={this.state.preSelectedModule}
          firstname={firstname}
          lastname={lastname}
          fromEmail={fromEmail}
          onCancel={() => this.setState({ showCreateMode: false, preSelectedModule: null })}
          onCheckingMail={() => {
            this.setState({ showCreateMode: false, preSelectedModule: null });
            this.props.onCheckingMail();
          }}
          onLogout={this.props.onLogout}
          {...this.props}
        />
      );
    }

    // If no results, show module list directly for creation
    if (totalCount === 0) {
      return (
        <div className="space-y-4">
          {/* Email Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {`${firstname} ${lastname}`}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  <span className="truncate">{fromEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module List for Creation */}
          <CreateMode
            firstname={firstname}
            lastname={lastname}
            fromEmail={fromEmail}
            onCancel={() => this.props.onCheckingMail()}
            onCheckingMail={this.props.onCheckingMail}
            onLogout={this.props.onLogout}
            hideUserCard={true}
          />

          {/* Refresh Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <button
              className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onClick={this.props.onCheckingMail}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh Search
            </button>
          </div>
        </div>
      );
    }

    // Multiple results - show list
    return (
      <div className="space-y-4">
        {/* Link Email Dialog */}
        <Transition appear show={showLinkEmailDialog} as={React.Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => this.setState({ showLinkEmailDialog: false })}>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <div className="flex items-center">
                        <LinkIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                          Link Email with Other Records
                        </Dialog.Title>
                      </div>
                      <button
                        onClick={() => this.setState({ showLinkEmailDialog: false })}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Module Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Module
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={selectedModule}
                          onChange={this.handleModuleChange}
                        >
                          <option value="">Choose a module...</option>
                          {moduleOptions.map((module) => (
                            <option key={module.value} value={module.value}>
                              {module.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Records
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder={selectedModule ? `Search ${selectedModule} records...` : "Select a module first"}
                            value={searchQuery}
                            onChange={this.handleSearchInputChange}
                            disabled={!selectedModule}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {searchLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            ) : (
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Type at least 2 characters to search
                        </p>
                      </div>

                      {/* Search Results */}
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {searchLoading ? (
                          <div className="p-4 text-center">
                            <LoadingSpinner label="Searching..." size="small" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {searchResults.map((record, index) => (
                              <button
                                key={index}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                onClick={() => this.handleLinkEmailWithRecord(record)}
                                disabled={linkEmailLoading}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {record.label || record.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      <span>ID: {record.crmid || record.id}</span>
                                    </p>
                                    
                                    {/* Display header fields if available */}
                                    {record.header_fields && record.header_fields.length > 0 && (
                                      <div className="mt-1 space-y-1">
                                        {record.header_fields.slice(0, 2).map((field, fieldIndex) => (
                                          field.value && field.value.trim() !== '' && (
                                            <div key={fieldIndex} className="flex items-center text-xs text-gray-500">
                                              <span className="font-medium mr-1">{field.fieldlabel}:</span>
                                              <span className="truncate">{field.value}</span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : searchQuery.length >= 2 && selectedModule ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No records found for "{searchQuery}" in {selectedModule}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            {!selectedModule 
                              ? "Please select a module and start typing to search"
                              : "Type at least 2 characters to search"
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => this.setState({ 
                            showLinkEmailDialog: false,
                            selectedModule: '',
                            searchQuery: '',
                            searchResults: []
                          })}
                          disabled={linkEmailLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Email Info Card */}
      

        {/* Search Results List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
         

          {/* Results List */}
          <div className="divide-y divide-gray-200">
            {results.map((record, index) => (
              <div
                key={index}
                className="px-4 py-4"
              >
                {/* Record Header with ShowHeadFields */}
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <ShowHeadFields data={record} />
                    </div>
                    
                    {/* Action Icons */}
                    <div className="ml-4 flex items-center space-x-2">
                      {/* View Details Icon */}
                      {record.viewable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            this.props.onRecordSelect(record);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                      {/* Edit Icon */}
                      {record.editable && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={(e) => this.handleEditClick(e, record)}
                          title="Edit Record"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="w-full">
                  <button
                    className="w-full flex items-center justify-left px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    style={{ backgroundColor: '#339fcf' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0075a8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#339fcf'}
                    onClick={() => this.handleArchiveEmail(record)}
                    disabled={archivingToRecord === record.crmid}
                  >
                    {archivingToRecord === record.crmid ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Log Email to {record.label}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <button
            onClick={() => this.setState({ showLinkEmailDialog: true })}
            className="w-full flex items-center justify-left px-3 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm text-left"
            style={{ backgroundColor: '#66b7db' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#339fcf'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#66b7db'}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Link Email with Other Records
          </button>
        </div>

        {/* Other Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-3">
            {/* Module Creation Buttons */}
            <div className="space-y-2">
                           {Object.entries(enabledModules)
                .filter(([moduleKey, moduleData]) => moduleData.is_create_view_permitted === true)
                .map(([moduleKey, moduleData]) => {
                  const displayName = moduleData.display_name || moduleData.label || moduleKey;
                  return (
                    <button
                      key={moduleKey}
                      onClick={() => this.handleCreateRecord(moduleKey)}
                      className="w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <UserIcon className="w-3 h-3 mr-2" />
                      Add as {displayName}
                    </button>
                  );
                })}
            </div>
            
           
          </div>
        </div>
      </div>
    );
  }
}

export default SearchResults;