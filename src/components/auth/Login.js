import React, { Component } from 'react';
import authService from '../../services/authService';
import pinService from '../../services/pinService';
import PinButton from '../common/PinButton';
import logo from '../../../assets/logo.png';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      validated: false,
      usernameError: '',
      passwordError: '',
      isPinned: false,
    };
  }

  componentDidMount() {
    // Subscribe to pin service
    this.unsubscribePin = pinService.subscribe((isPinned) => {
      console.log('Login: Pin state changed to:', isPinned);
      this.setState({ isPinned });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribePin) {
      this.unsubscribePin();
    }
  }

  validateField = (name, value) => {
    let error = '';
    
    if (name === 'username') {
      if (!value || value.trim() === '') {
        error = 'Username is required';
      }
    } else if (name === 'password') {
      if (!value || value.trim() === '') {
        error = 'Password is required';
      }
    }
    
    return error;
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const error = this.validateField(name, value);
    
    this.setState({
      [`${name}Error`]: error
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    // Validate both fields
    const usernameError = this.validateField('username', username);
    const passwordError = this.validateField('password', password);

    this.setState({
      usernameError,
      passwordError,
      validated: true
    });

    // If there are validation errors, don't proceed
    if (usernameError || passwordError) {
      return;
    }

    this.setState({ error: null, loading: true });

    try {
      console.log('Login: Form submitted, attempting login...');
      const result = await authService.login(username, password);

      console.log('Login: Login result received:', result);

      if (!result.success) {
        console.log('Login: Login failed with error:', result.error);
        this.setState({ error: result.error, loading: false });
      } else {
        console.log('Login: Login successful - auth service will handle state change');
      }
    } catch (error) {
      console.error('Login: Login error:', error);
      this.setState({ error: 'Login failed. Please try again.', loading: false });
    }
  };

  handlePinChange = (isPinned) => {
    console.log('Login: Pin state changed to:', isPinned);
    this.setState({ isPinned });
  };

  render() {
    const { loading, error, usernameError, passwordError, isPinned } = this.state;

    console.log('Login: Rendering login form. Loading:', loading, 'Error:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="card-body text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1"></div>
                <img src={logo} className="w-1/2" alt="Logo" />
                <div className="flex-1"></div>
              </div>
              <p className="text-sm text-gray-600 mb-6">Sign in to your account</p>
              
              <form className="space-y-4 text-left" onSubmit={this.handleSubmit}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    className={`input-field ${usernameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    type="text"
                    placeholder="Enter your username"
                    name="username"
                    disabled={loading}
                    onChange={this.handleInputChange}
                  />
                  {usernameError && (
                    <p className="text-xs text-red-600 mt-1">{usernameError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    className={`input-field ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    disabled={loading}
                    onChange={this.handleInputChange}
                  />
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  style={{ backgroundColor: '#0075a8' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#005e86'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#0075a8'}
                  disabled={loading}
                  type="submit"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                </button>
              </form>

              <div className="mt-6 text-xs text-gray-500">
                Powered by Revit CRM
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;