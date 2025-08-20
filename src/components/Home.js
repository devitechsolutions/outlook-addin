import React, { Component } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PowerIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';
import pinService from '../services/pinService';
import apiService from '../services/apiService';
import outlookService from '../services/outlookService';
import LoadingSpinner from './common/LoadingSpinner';
import PinButton from './common/PinButton';
import EditMode from './entity/EditMode';
import CreateMode from './entity/CreateMode';
import SearchResults from './entity/SearchResults';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: null,
      loading: true,
      checkingMail: true,
      selectedRecord: null,
      showLogoutDialog: false,
      isPinned: false,
      showPinInfo: false,
    };
  }

  componentDidMount() {
    console.log('Home component mounted - starting email check');
    console.log('Current user from props:', this.props.currentUser);
    
    // Subscribe to pin service
    this.unsubscribePin = pinService.subscribe((isPinned) => {
      console.log('Home: Pin state changed to:', isPinned);
      this.setState({ isPinned });
      
      if (isPinned) {
        // Show brief info about pinning
        this.setState({ showPinInfo: true });
        setTimeout(() => {
          this.setState({ showPinInfo: false });
        }, 3000);
      }
    });
    
    this.checkEmailRecord();
  }

  componentWillUnmount() {
    if (this.unsubscribePin) {
      this.unsubscribePin();
    }
  }

  checkEmailRecord = async () => {
    console.log('Starting email record check...');
    
    try {
      const currentUser = this.props.currentUser || authService.getCurrentUser();
      console.log('Current user for email check:', currentUser);
      
      if (!currentUser) {
        console.error('No current user found - cannot check email record');
        this.setState({ loading: false, searchResults: null });
        return;
      }

      const fromEmail = outlookService.getFromEmail();
      console.log('From email extracted:', fromEmail);
      
      if (!fromEmail) {
        console.error('No from email found');
        this.setState({ loading: false, searchResults: null });
        return;
      }

      console.log('Making API call to check email record for:', fromEmail);
      
      const result = await apiService.getRecordDetailFromEmail(fromEmail);
      console.log('Email record check result:', result);
      
      this.setState({ loading: false });
      
      if (result.success) {
        const searchData = result.data.data || result.data;
        console.log('Search results for email:', searchData);
        
        // Handle different result scenarios
        if (Array.isArray(searchData) && searchData.length > 0) {
          // Always show search results first, let user choose what to do
          console.log('Search results found, showing list:', searchData.length);
          this.setState({ searchResults: searchData });
        } else if (searchData && typeof searchData === 'object') {
          // Single object result - show in list
          console.log('Single object result found, showing in list:', searchData);
          this.setState({ searchResults: [searchData] });
        } else {
          // No results - will show module list for creation
          console.log('No results found, will show module list');
          this.setState({ searchResults: null });
        }
      } else if (result.needsLogout) {
        console.log('Session expired - logging out');
        this.handleLogout();
      } else {
        console.log('No record found for email or API error');
        this.setState({ searchResults: null });
      }
    } catch (error) {
      console.error('Error checking email record:', error);
      this.setState({ loading: false, searchResults: null });
      
      if (error.message.includes('not authenticated') || error.message.includes('CRM URL')) {
        console.log('Authentication error - logging out');
        this.handleLogout();
      }
    }
  };

  handleCheckingMail = () => {
    console.log('Refreshing email record check...');
    this.setState({ 
      checkingMail: !this.state.checkingMail,
      loading: true,
      searchResults: null,
      selectedRecord: null
    }, () => {
      this.checkEmailRecord();
    });
  };

  handleRecordSelect = (record) => {
    console.log('Record selected:', record);
    this.setState({ selectedRecord: record });
  };

  handleBackToResults = () => {
    this.setState({ selectedRecord: null });
  };

  handleLogoutClick = () => {
    this.setState({ showLogoutDialog: true });
  };

  handleLogoutConfirm = () => {
    this.setState({ showLogoutDialog: false });
    authService.logout();
  };

  handleLogoutCancel = () => {
    this.setState({ showLogoutDialog: false });
  };

  handlePinChange = (isPinned) => {
    console.log('Home: Pin state changed to:', isPinned);
    this.setState({ isPinned });
    
    if (isPinned) {
      // Show brief info about pinning
      this.setState({ showPinInfo: true });
      setTimeout(() => {
        this.setState({ showPinInfo: false });
      }, 3000);
    }
  };

  render() {
    const { searchResults, selectedRecord, loading, showLogoutDialog, isPinned, showPinInfo } = this.state;
    const currentUser = this.props.currentUser || authService.getCurrentUser();
    
    console.log('Home render - loading:', loading, 'searchResults:', searchResults, 'selectedRecord:', selectedRecord);
    
    if (!currentUser) {
      console.log('No current user in Home render - this should not happen');
      return <LoadingSpinner label="Loading user data..." />;
    }

    const { firstname, lastname } = outlookService.parseDisplayName();
    const fromEmail = outlookService.getFromEmail();

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Checking email records..." variant="modern" size="large" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Logout Confirmation Dialog */}
        <Transition appear show={showLogoutDialog} as={React.Fragment}>
          <Dialog as="div" className="relative z-10" onClose={this.handleLogoutCancel}>
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
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Confirm Logout
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to logout?
                      </p>
                    </div>

                    <div className="mt-4 flex gap-3 justify-end">
                      <button
                        type="button"
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                        onClick={this.handleLogoutCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
                        style={{ backgroundColor: '#0075a8' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#005e86'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0075a8'}
                        onClick={this.handleLogoutConfirm}
                      >
                        Logout
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              
              <span className="text-base font-semibold text-gray-900">
                Welcome {currentUser?.username}
              </span>
              {isPinned && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <PinButton 
                onPinChange={this.handlePinChange}
                size="small"
                showAlways={true}
              />
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={this.handleLogoutClick}
                title="Logout"
              >
                <PowerIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Pin Info Banner */}
          {showPinInfo && (
            <div className="bg-primary-50 border-b border-primary-200 px-4 py-2">
              <div className="flex items-center">
                <InformationCircleIcon className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-xs text-primary-700">
                  Plugin is now pinned and will stay open when switching emails
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-4">
          {searchResults && searchResults.length > 0 ? (
            selectedRecord ? (
              <EditMode
                entity_info={selectedRecord}
                firstname={firstname}
                lastname={lastname}
                fromEmail={fromEmail}
                onCheckingMail={this.handleCheckingMail}
                onLogout={this.handleLogoutConfirm}
                onBack={this.handleBackToResults}
              />
            ) : (
              <SearchResults
                results={searchResults}
                onRecordSelect={this.handleRecordSelect}
                onCheckingMail={this.handleCheckingMail}
                onLogout={this.handleLogoutConfirm}
              />
            )
          ) : selectedRecord ? (
            <EditMode
              entity_info={selectedRecord}
              firstname={firstname}
              lastname={lastname}
              fromEmail={fromEmail}
              onCheckingMail={this.handleCheckingMail}
              onLogout={this.handleLogoutConfirm}
              onBack={null}
            />
          ) : (
            <SearchResults
              results={[]}
              onRecordSelect={this.handleRecordSelect}
              onCheckingMail={this.handleCheckingMail}
              onLogout={this.handleLogoutConfirm}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Home;
