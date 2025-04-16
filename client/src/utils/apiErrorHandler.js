export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data.error || 'Bad request. Please check your input.',
          type: 'error'
        };
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          type: 'auth',
          action: () => {
            localStorage.removeItem('token');
            window.location.href = '/auth';
          }
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          type: 'error'
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          type: 'error'
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          type: 'error'
        };
      default:
        return {
          message: data.error || 'An unexpected error occurred.',
          type: 'error'
        };
    }
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'Network error. Please check your connection.',
      type: 'network'
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred.',
      type: 'error'
    };
  }
};

export const showErrorNotification = (error, setError) => {
  const errorInfo = handleApiError(error);
  setError(errorInfo.message);
  
  if (errorInfo.type === 'auth' && errorInfo.action) {
    errorInfo.action();
  }
  
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    setError('');
  }, 5000);
}; 