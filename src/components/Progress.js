import * as React from 'react';
import PropTypes from 'prop-types';

export default class Progress extends React.Component {
  render() {
    const { logo, title, message } = this.props;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-200 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          {/* Logo Container */}
          <div className="mb-8">
            <div className="relative inline-block">
              {logo && (
                <img 
                  width="80" 
                  height="80" 
                  src={logo} 
                  alt={title} 
                  title={title}
                  className="mx-auto rounded-2xl shadow-lg"
                />
              )}
              
              {/* Animated Ring Around Logo */}
              <div className="absolute inset-0 rounded-2xl">
                <div className="w-full h-full rounded-2xl border-4 border-primary-300 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Modern Spinner */}
          <div className="mb-6">
            <div className="relative w-16 h-16 mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary-300"></div>
              
              {/* Animated Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
              
              {/* Inner Dot */}
              <div className="absolute inset-4 rounded-full bg-primary-500 animate-pulse"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {title || 'Revit CRM'}
            </h2>
            
            <p className="text-sm text-gray-600">
              {message || 'Plugin loading, please wait...'}
            </p>
            
            {/* Progress Dots */}
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    );
  }
}

Progress.propTypes = {
  logo: PropTypes.string,
  message: PropTypes.string,
  title: PropTypes.string,
};