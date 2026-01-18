/**
 * Clerk Authentication Helper
 * Handles phone authentication with OTP verification
 */

export const clerPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Phone authentication states
export const PHONE_AUTH_STATES = {
  IDLE: 'idle',
  SENDING: 'sending',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Error messages mapping
export const CLERK_ERROR_MESSAGES = {
  'phone_number_invalid': 'Please enter a valid 10-digit phone number',
  'password_incorrect': 'Invalid verification code',
  'verification_code_incorrect': 'Invalid verification code',
  'too_many_attempts': 'Too many verification attempts. Please try again later',
  'rate_limited': 'Too many requests. Please wait before trying again',
  'not_allowed': 'Phone authentication is not enabled. Contact support',
  'network_error': 'Network error. Please check your connection',
  'invalid_request': 'Invalid request. Please try again',
  'default': 'An error occurred. Please try again'
};

/**
 * Format phone number for Clerk
 * Adds +91 country code for India
 */
export const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Ensure it's 10 digits
  if (cleanPhone.length !== 10) {
    throw new Error('Please enter a valid 10-digit phone number');
  }
  
  // Add India country code
  return `+91${cleanPhone}`;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return CLERK_ERROR_MESSAGES.default;
  
  // Handle error code
  if (error.code) {
    return CLERK_ERROR_MESSAGES[error.code] || 
           CLERK_ERROR_MESSAGES.default;
  }
  
  // Handle error message
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle error object with message
  if (error.message) {
    const lowerMessage = error.message.toLowerCase();
    
    if (lowerMessage.includes('phone')) {
      return CLERK_ERROR_MESSAGES.phone_number_invalid;
    }
    if (lowerMessage.includes('code') || lowerMessage.includes('verification')) {
      return CLERK_ERROR_MESSAGES.verification_code_incorrect;
    }
    if (lowerMessage.includes('network')) {
      return CLERK_ERROR_MESSAGES.network_error;
    }
    
    return error.message;
  }
  
  return CLERK_ERROR_MESSAGES.default;
};

/**
 * Log authentication steps for debugging
 */
export const logAuthStep = (step, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] ${step}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${prefix}: ${message}`, data || '');
  }
};
