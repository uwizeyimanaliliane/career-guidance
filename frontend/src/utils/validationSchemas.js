// Email validation regex with stricter rules
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex
const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  noSpaces: /^\S*$/,
};

// Phone validation regex
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

// Username validation
const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

// Custom validation functions
const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
};

const validateRole = (role) => {
  if (!role || !['admin', 'staff'].includes(role)) {
    return 'Role selection is required';
  }
  return null;
};

const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === '') {
    return 'Full name is required';
  }
  if (fullName.length < 2) {
    return 'Full name must be at least 2 characters';
  }
  if (fullName.length > 50) {
    return 'Full name cannot exceed 50 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    return 'Full name can only contain letters and spaces';
  }
  return null;
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords must match';
  }
  return null;
};

const validateTermsAccepted = (termsAccepted) => {
  if (!termsAccepted) {
    return 'You must accept the terms and conditions';
  }
  return null;
};

// Login validation schema
export const loginSchema = {
  validate: async (data) => {
    const errors = {};
    
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    
    const roleError = validateRole(data.role);
    if (roleError) errors.role = roleError;
    
    if (Object.keys(errors).length > 0) {
      throw { inner: Object.keys(errors).map(key => ({ path: key, message: errors[key] })) };
    }
    
    return true;
  },
  validateAt: async (field, data) => {
    const value = data[field];
    let error = null;
    
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'role':
        error = validateRole(value);
        break;
      default:
        break;
    }
    
    if (error) {
      throw { message: error };
    }
    
    return true;
  }
};

// Register validation schema
export const registerSchema = {
  validate: async (data) => {
    const errors = {};
    
    const fullNameError = validateFullName(data.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    
    // Additional password validations
    if (data.password) {
      if (!passwordRegex.uppercase.test(data.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!passwordRegex.lowercase.test(data.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!passwordRegex.number.test(data.password)) {
        errors.password = 'Password must contain at least one number';
      } else if (!passwordRegex.special.test(data.password)) {
        errors.password = 'Password must contain at least one special character';
      } else if (!passwordRegex.noSpaces.test(data.password)) {
        errors.password = 'Password cannot contain spaces';
      }
    }
    
    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    const roleError = validateRole(data.role);
    if (roleError) errors.role = roleError;
    
    const termsError = validateTermsAccepted(data.termsAccepted);
    if (termsError) errors.termsAccepted = termsError;
    
    if (Object.keys(errors).length > 0) {
      throw { inner: Object.keys(errors).map(key => ({ path: key, message: errors[key] })) };
    }
    
    return true;
  },
  validateAt: async (field, data) => {
    const value = data[field];
    let error = null;
    
    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Additional password validations
        if (!error && value) {
          if (!passwordRegex.uppercase.test(value)) {
            error = 'Password must contain at least one uppercase letter';
          } else if (!passwordRegex.lowercase.test(value)) {
            error = 'Password must contain at least one lowercase letter';
          } else if (!passwordRegex.number.test(value)) {
            error = 'Password must contain at least one number';
          } else if (!passwordRegex.special.test(value)) {
            error = 'Password must contain at least one special character';
          } else if (!passwordRegex.noSpaces.test(value)) {
            error = 'Password cannot contain spaces';
          }
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(data.password, value);
        break;
      case 'role':
        error = validateRole(value);
        break;
      case 'termsAccepted':
        error = validateTermsAccepted(value);
        break;
      default:
        break;
    }
    
    if (error) {
      throw { message: error };
    }
    
    return true;
  }
};

// Password strength calculation
export const passwordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      percentage: 0,
      level: 'weak',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        noSpaces: false,
      },
    };
  }

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: passwordRegex.uppercase.test(password),
    lowercase: passwordRegex.lowercase.test(password),
    number: passwordRegex.number.test(password),
    special: passwordRegex.special.test(password),
    noSpaces: passwordRegex.noSpaces.test(password),
  };

  Object.values(checks).forEach(check => {
    if (check) strength += 1;
  });

  return {
    score: strength,
    percentage: (strength / 6) * 100,
    level: strength < 3 ? 'weak' : strength < 5 ? 'medium' : 'strong',
    checks,
  };
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};
