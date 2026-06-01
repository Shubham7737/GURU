const validator = require('validator');

// Email validation
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Password validation (min 6 chars, at least one number and one letter)
const isValidPassword = (password) => {
  if (!password || password.length < 6) return false;
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password);
};

// Phone validation
const isValidPhone = (phone) => {
  return validator.isMobilePhone(phone);
};

// Name validation
const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Validation helper
const validateAuthInput = (data, fields = []) => {
  const errors = {};

  if (fields.includes('email')) {
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
  }

  if (fields.includes('password')) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(data.password)) {
      errors.password = 'Password must be at least 6 characters with letters and numbers';
    }
  }

  if (fields.includes('name')) {
    if (!data.name) {
      errors.name = 'Name is required';
    } else if (!isValidName(data.name)) {
      errors.name = 'Name must be between 2 and 100 characters';
    }
  }

  if (fields.includes('phone') && data.phone) {
    if (!isValidPhone(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.trim(validator.escape(input));
  }
  return input;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  validateAuthInput,
  sanitizeInput,
};
