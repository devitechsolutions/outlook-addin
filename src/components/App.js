import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import authService from '../services/authService';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import Login from './auth/Login';
import Home from './Home';
import Progress from './Progress';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      authLoading: true,
      authInitialized: false,
    };
  }

  componentDidMount() {
    console.log('App component mounted');
    
    // Subscribe to auth state changes
    this.unsubscribe = authService.subscribe((user) => {
      console.log('App: Auth state changed, received user:', user);
      this.setState({ 
        currentUser: user,
        authLoading: false,
        authInitialized: true
      });
    });

    // Start auth check immediately if Office is ready, otherwise wait
    if (this.props.isOfficeInitialized) {
      console.log('App: Office.js is ready, starting auth check immediately');
      this.checkAuthStatus();
    } else {
      console.log('App: Office.js not ready yet, will check auth when ready');
    }
  }

  componentDidUpdate(prevProps) {
    // Check auth status when Office.js becomes ready
    if (!prevProps.isOfficeInitialized && this.props.isOfficeInitialized) {
      console.log('App: Office.js became ready, checking auth status...');
      this.checkAuthStatus();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async checkAuthStatus() {
    console.log('App: Checking auth status...');
    try {
      const user = await authService.checkAuthStatus();
      console.log('App: Auth check result:', user);
      
      // Update state if not already updated by subscription
      if (!this.state.authInitialized) {
        this.setState({ 
          currentUser: user,
          authLoading: false,
          authInitialized: true
        });
      }
    } catch (error) {
      console.error('App: Auth check error:', error);
      this.setState({ 
        authLoading: false,
        authInitialized: true,
        currentUser: null
      });
    }
  }

  render() {
    const { title, isOfficeInitialized } = this.props;
    const { currentUser, authLoading, authInitialized } = this.state;

    console.log('App render - Office initialized:', isOfficeInitialized, 'Auth loading:', authLoading, 'Auth initialized:', authInitialized, 'Current user:', !!currentUser);

    // Show initial loading while Office.js initializes
    if (!isOfficeInitialized) {
      console.log('App: Showing Office loading screen');
      return (
        <Progress
          title={title}
          logo={require('../../assets/logo.png')}
          message="Plugin loading, please wait..."
        />
      );
    }

    // Show auth loading after Office.js is ready
    if (authLoading || !authInitialized) {
      console.log('App: Showing auth loading screen');
      return (
        <div className="min-vh-100 bg-white">
          <LoadingSpinner label="Checking authentication..." />
        </div>
      );
    }

    console.log('App: Rendering main content. Current user exists:', !!currentUser);

    return (
      <ErrorBoundary>
        <div className="App" style={{ backgroundColor: '#f7f7f7' }}>
          <ToastContainer theme="colored" />
          {currentUser ? (
            <Home currentUser={currentUser} />
          ) : (
            <Login />
          )}
        </div>
      </ErrorBoundary>
    );
  }
}

App.propTypes = {
  title: PropTypes.string,
  isOfficeInitialized: PropTypes.bool,
};

export default App;