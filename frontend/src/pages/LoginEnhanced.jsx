import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { loginSchema, sanitizeInput } from '../utils/validationSchemas';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function LoginEnhanced() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [realTimeValidation, setRealTimeValidation] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Real-time validation
  useEffect(() => {
    const validateField = async (field, value) => {
      try {
        await loginSchema.validateAt(field, { [field]: value });
        setRealTimeValidation(prev => ({ ...prev, [field]: 'valid' }));
      } catch (error) {
        setRealTimeValidation(prev => ({ ...prev, [field]: error.message }));
      }
    };

    Object.keys(formData).forEach(field => {
      if (touched[field] && formData[field]) {
        validateField(field, formData[field]);
      }
    });
  }, [formData, touched]);

  // Handle lockout
  useEffect(() => {
    if (attemptCount >= 5) {
      const lockoutDuration = 5 * 60 * 1000; // 5 minutes
      setLockoutTime(Date.now() + lockoutDuration);
      setTimeout(() => {
        setAttemptCount(0);
        setLockoutTime(null);
      }, lockoutDuration);
    }
  }, [attemptCount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const sanitizedValue = type === 'checkbox' ? checked : sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = async () => {
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (lockoutTime && Date.now() < lockoutTime) {
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const userRole = result.user?.role;
        
        if (userRole === formData.role) {
          // Handle remember me
          if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          
          navigate('/dashboard');
        } else {
          setErrors({ role: `This account is registered as ${userRole}, but you selected ${formData.role}. Please select the correct role.` });
        }
      } else {
        setAttemptCount(prev => prev + 1);
        setErrors({ general: result.error || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setAttemptCount(prev => prev + 1);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (field) => {
    const baseClasses = "w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200";
    
    if (errors[field]) {
      return `${baseClasses} border-red-500 focus:ring-red-500`;
    }
    
    if (realTimeValidation[field] === 'valid') {
      return `${baseClasses} border-green-500 focus:ring-green-500`;
    }
    
    return `${baseClasses} border-gray-300 focus:ring-green-700`;
  };

  const getFieldIcon = (field) => {
    if (errors[field]) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (realTimeValidation[field] === 'valid') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return null;
  };

  const isLockedOut = lockoutTime && Date.now() < lockoutTime;
  const remainingLockoutTime = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {/* Lockout Warning */}
          {isLockedOut && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              <AlertCircle className="inline w-4 h-4 mr-2" />
              Too many failed attempts. Please try again in {remainingLockoutTime} seconds.
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={getInputClassName('email')}
                  placeholder="Enter your email"
                  disabled={isLockedOut}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldIcon('email')}
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={getInputClassName('password')}
                  placeholder="Enter your password"
                  disabled={isLockedOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  {getFieldIcon('password')}
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={() => handleBlur('role')}
                className={getInputClassName('role')}
                disabled={isLockedOut}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  disabled={isLockedOut}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-green-600 hover:text-green-500">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full bg-green-800 hover:bg-green-900 disabled:bg-green-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-green-800 hover:text-green-900 font-medium underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginEnhanced;
