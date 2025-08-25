import React, { Component } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { 
  ArrowLeftIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArchiveBoxIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import outlookService from '../../services/outlookService';
import storageService from '../../services/storageService';
import authService from '../../services/authService';
import pinService from '../../services/pinService';
import LoadingSpinner from '../common/LoadingSpinner';
import PinButton from '../common/PinButton';
import EntityDetail from './EntityDetail';
import Activities from './Activities';
import AddCommentForm from './AddCommentForm';
import EntityForm from '../forms/EntityForm';
import ShowHeadFields from './ShowHeadFields';
import { renderIcon } from '../utils/Common';
import { toast } from 'react-toastify';

class EditMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      showDetail: false,
      showActivities: false,
      showComment: false,
      loading: false,
      relatedTabs: [],
      loadingRelatedTabs: true,
      showArchiveDialog: false,
      showLinkEmailDialog: false,
      linkEmailLoading: false,
      enabledModules: {},
      selectedModule: '',
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchTimeout: null,
      isPinned: false,
    };
  }

  componentDidMount() {
    // Subscribe to pin service
    this.unsubscribePin = pinService.subscribe((isPinned) => {
      console.log('EditMode: Pin state changed to:', isPinned);
      this.setState({ isPinned });
    });
    
    this.loadRelatedTabs();
    this.loadEnabledModules();
  }

  componentWillUnmount() {
    if (this.unsubscribePin) {
      this.unsubscribePin();
    }
  }

  loadRelatedTabs = async () => {
    const { entity_info, onLogout } = this.props;
    
    this.setState({ loadingRelatedTabs: true });
    
    console.log('EditMode: Loading related tabs for module:', entity_info.module);
    
    try {
      const result = await apiService.getRelatedTabModules(entity_info.module, entity_info.crmid);
      console.log('EditMode: Related tabs API result:', result);
      
      if (result.success) {
        // Handle the new API response structure - related tabs are arrays now
        const relatedTabsData = result.data.data || [];
        console.log('EditMode: Related tabs data received:', relatedTabsData);
        console.log('EditMode: Number of related tabs:', relatedTabsData.length);
        
        // Convert array to object for easier rendering
        const relatedTabsObject = {};
        relatedTabsData.forEach(tab => {
          relatedTabsObject[tab.type] = tab.label;
        });
        
        this.setState({
          relatedTabs: relatedTabsObject,
          loadingRelatedTabs: false,
        });
      } else if (result.needsLogout && onLogout) {
        onLogout();
      } else {
        console.log('EditMode: Related tabs API failed:', result.error);
        this.setState({ loadingRelatedTabs: false });
      }
    } catch (error) {
      console.error('Error loading related tabs:', error);
      this.setState({ loadingRelatedTabs: false });
    }
  };

  loadEnabledModules = () => {
    console.log('EditMode: Loading enabled modules from stored user data...');
    
    // Get enabled modules from authService
    const enabledModules = authService.getEnabledModules();
    console.log('EditMode: Enabled modules from user data:', enabledModules);
    
    this.setState({
      enabledModules: enabledModules,
    });
  };

  handleArchiveEmail = async () => {
    try {
      this.setState({ showArchiveDialog: false, loading: true });

      const user = await storageService.getUser();
      
      console.log('EditMode: Starting email archive process...');
      console.log('EditMode: Parent record ID:', this.props.entity_info.crmid);
      console.log('EditMode: Current user ID:', user.userid);
      
      // Validate Office.js context before proceeding
      if (!Office.context || !Office.context.mailbox || !Office.context.mailbox.item) {
        throw new Error('Office.js context not available. Please refresh the add-in.');
      }
      
      // Get complete email data including attachments, CC, BCC, etc.
      const completeEmailData = await outlookService.createCompleteEmailArchiveData(
        this.props.entity_info.crmid,
        user.userid
      );

      console.log('EditMode: Complete email data prepared:', {
        subject: completeEmailData.subject,
        from: completeEmailData.from,
        toCount: completeEmailData.to.length,
        ccCount: completeEmailData.cc.length,
        attachmentCount: completeEmailData.attachments.length,
        hasHtmlBody: !!completeEmailData.bodyHtml,
        hasTextBody: !!completeEmailData.bodyText,
        hasCallbackToken: !!completeEmailData.callbackToken,
        hasUserIdentityToken: !!completeEmailData.userIdentityToken
      });

      // Validate required tokens for attachment processing
      if (completeEmailData.attachments.length > 0 && !completeEmailData.callbackToken) {
        throw new Error('Unable to get access token for attachment processing. Please try again.');
      }

      const result = await apiService.archiveEmail(completeEmailData);

      if (result.success) {
        const attachmentText = completeEmailData.hasAttachments 
          ? ` with ${completeEmailData.attachments.length} attachment(s)` 
          : '';
        
        toast.success(`Email archived successfully${attachmentText}`, {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
        
        console.log('EditMode: Email archived successfully');
      } else if (result.needsLogout && this.props.onLogout) {
        console.log('EditMode: Session expired during email archive');
        this.props.onLogout();
      } else {
        console.error('EditMode: Email archive failed:', result.error);
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
      this.setState({ loading: false });
    }
  };

  handleLinkEmailWithRecord = async (selectedRecord) => {
    try {
      this.setState({ linkEmailLoading: true });

      const user = await storageService.getUser();
      
      console.log('EditMode: Starting email linking process...');
      console.log('EditMode: Target record ID:', selectedRecord.crmid);
      console.log('EditMode: Current user ID:', user.userid);
      
      // Validate Office.js context before proceeding
      if (!Office.context || !Office.context.mailbox || !Office.context.mailbox.item) {
        throw new Error('Office.js context not available. Please refresh the add-in.');
      }
      
      // Get complete email data for linking
      const completeEmailData = await outlookService.createCompleteEmailArchiveData(
        selectedRecord.crmid,
        user.userid
      );

      console.log('EditMode: Email data prepared for linking:', {
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
        
        console.log('EditMode: Email linked successfully');
        this.setState({ 
          showLinkEmailDialog: false,
          selectedModule: '',
          searchQuery: '',
          searchResults: []
        });
      } else if (result.needsLogout && this.props.onLogout) {
        console.log('EditMode: Session expired during email linking');
        this.props.onLogout();
      } else {
        console.error('EditMode: Email linking failed:', result.error);
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
      console.log(`EditMode: Searching in module ${this.state.selectedModule} for: ${query}`);
      
      const result = await apiService.searchRecords(this.state.selectedModule, query);

      if (result.success) {
        const searchData = result.data.data || result.data.records || result.data || [];
        console.log(`EditMode: Found ${searchData.length} records`);
        
        // Process the search results to ensure they have the right structure
        const processedResults = Array.isArray(searchData) ? searchData.map(record => ({
          ...record,
          crmid: record.id || record.crmid,
          label: record.label || record.name || 'Unnamed Record',
          module: this.state.selectedModule
        })) : [];
        
        console.log(`EditMode: Processed ${processedResults.length} search results:`, processedResults);
        this.setState({ searchResults: processedResults });
      } else {
        console.warn('EditMode: Search failed:', result.error);
        this.setState({ searchResults: [] });
      }
    } catch (error) {
      console.error('Error performing search:', error);
      this.setState({ searchResults: [] });
    } finally {
      this.setState({ searchLoading: false });
    }
  };

  handlePinChange = (isPinned) => {
    console.log('EditMode: Pin state changed to:', isPinned);
    this.setState({ isPinned });
  };

  handleRelatedModuleInfo = (relModule) => {
    if (relModule === 'Calendar') {
      this.setState({ showActivities: true });
    } else if (relModule === 'ModComments') {
      this.setState({ showComment: true });
    } else if (relModule === 'Detail') {
      this.setState({ showDetail: true });
    }
    // Add other related module handlers as needed
  };

  render() {
    const {
      showForm,
      showDetail,
      showActivities,
      showComment,
      loading,
      relatedTabs,
      loadingRelatedTabs,
      showArchiveDialog,
      showLinkEmailDialog,
      linkEmailLoading,
      enabledModules,
      selectedModule,
      searchQuery,
      searchResults,
      searchLoading,
      isPinned,
    } = this.state;

    const { entity_info, onLogout, onBack } = this.props;

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Processing..." variant="modern" size="large" />
        </div>
      );
    }

    // Convert enabled modules to array for dropdown
    const moduleOptions = Object.entries(enabledModules).map(([key, moduleData]) => ({
      value: key,
      label: moduleData.display_name || moduleData.label || key
    }));

    return (
      <div className="space-y-4">
        {/* Archive Email Confirmation Dialog */}
        <Transition appear show={showArchiveDialog} as={React.Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => this.setState({ showArchiveDialog: false })}>
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="ml-3">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Archive Email
                        </Dialog.Title>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to archive this email? This action will save the email and associate it with the current record.
                      </p>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="btn-outline text-sm"
                        onClick={() => this.setState({ showArchiveDialog: false })}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary text-sm"
                        onClick={this.handleArchiveEmail}
                      >
                        Archive Email
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

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

        {showForm ? (
          <EntityForm
            module={entity_info.module}
            crmid={entity_info.crmid}
            onCancel={() => this.setState({ showForm: false })}
            onSuccess={() => this.setState({ showForm: false })}
            onLogout={onLogout}
          />
        ) : showDetail ? (
          <EntityDetail
            module={entity_info.module}
            crmid={entity_info.crmid}
            onCancel={() => this.setState({ showDetail: false })}
            onBack={onBack}
            onLogout={onLogout}
          />
        ) : showActivities ? (
          <Activities
            module={entity_info.module}
            crmid={entity_info.crmid}
            onCancel={() => this.setState({ showActivities: false })}
            onLogout={onLogout}
          />
        ) : showComment ? (
          <AddCommentForm
            crmid={entity_info.crmid}
            onCancel={() => this.setState({ showComment: false })}
            onLogout={onLogout}
          />
        ) : (
          <div className="space-y-4">
            {/* Record Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
             {/* Back Navigation */}
             {onBack && (
  <div className="mb-4 pb-4 border-b border-gray-200">
    <button
      onClick={onBack}
      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ArrowLeftIcon className="w-4 h-4 mr-2" />
      Back to Results
    </button>
  </div>
)}
             
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <ShowHeadFields data={entity_info} />
                    </div>
                    
                    {/* Edit Icon */}
                    <div className="ml-4 flex items-center space-x-2">
                      {entity_info.editable && (
                        <button
                          onClick={() => this.setState({ showForm: true })}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Record"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Email Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-3">
                <button
                  onClick={() => this.setState({ showArchiveDialog: true })}
                  className="w-full flex items-center justify-start px-3 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm text-left"
                  style={{ backgroundColor: '#339fcf' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0075a8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#339fcf'}
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Log Email to {entity_info.label}
                </button>
                
                {!showDetail && (
                  <button
                    onClick={() => this.setState({ showLinkEmailDialog: true })}
                    className="w-full flex items-center justify-start px-3 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm text-left"
                    style={{ backgroundColor: '#66b7db' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#339fcf'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#66b7db'}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link Email with Other Records
                  </button>
                )}
              </div>
            </div>

            {/* Related Tabs */}
            {loadingRelatedTabs ? (
              <LoadingSpinner label="Loading related tabs..." />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Related Information</h3>
                  <h3 className="text-base font-semibold text-gray-900">Related Information</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(relatedTabs).map(([key, value]) => (
                    <button
                      key={key}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      onClick={() => this.handleRelatedModuleInfo(key)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {renderIcon(key)}
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-900">{value}</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{value}</span>
                      </div>
                      <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default EditMode;