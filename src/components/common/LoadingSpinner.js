import React from 'react';

const LoadingSpinner = ({ label = 'Loading...', size = 'medium', variant = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex space-x-1 mb-4">
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {label}
        </span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className={`relative ${sizeClasses[size]} mb-4`}>
          <div className="absolute inset-0 rounded-full bg-primary-300 animate-ping"></div>
          <div className="relative rounded-full bg-primary-500 h-full w-full animate-pulse"></div>
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {label}
        </span>
      </div>
    );
  }

  if (variant === 'modern') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className={`relative ${sizeClasses[size]} mb-4`}>
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-300"></div>
          
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500 animate-spin"></div>
          
          {/* Inner Dot */}
          <div className="absolute inset-2 rounded-full bg-primary-500 animate-pulse"></div>
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {label}
        </span>
      </div>
    );
  }
  
  // Default spinner
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizeClasses[size]} mb-3`}>
      </div>
      <span className="text-sm text-gray-600 font-medium">
        {label}
      </span>
    </div>
  );
};

export default LoadingSpinner;