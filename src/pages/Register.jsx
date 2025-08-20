import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralInfo, setReferralInfo] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      console.log('📝 Register: Attempting registration with:', { 
        username: formData.username, 
        email: formData.email 
      });
      
      // Prepare user data in the format expected by the backend
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        referralId: referralInfo?.referralId // Include referral ID if available
      };
      
      const result = await register(userData);
      console.log('📝 Register: Result received:', result);
      
      if (result.success) {
        console.log('✅ Register: Successful, redirecting to home');
        
        // Limpiar referralId del localStorage después del registro exitoso
        if (referralInfo?.referralId) {
          localStorage.removeItem('referralId');
          console.log('🧹 Referral ID limpiado del localStorage');
        }
        
        navigate('/');
      } else {
        console.log('❌ Register: Failed with error:', result.error);
        setErrors({ submit: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('❌ Register: Error occurred:', error);
      setErrors({ submit: error.message || 'An error occurred during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Capturar información del referido al cargar el componente
  useEffect(() => {
    // Verificar si hay información del referido en el estado de navegación
    if (location.state?.referralId) {
      setReferralInfo({
        referralId: location.state.referralId,
        referrer: location.state.referrer
      });
    } else {
      // Verificar si hay referralId en localStorage (fallback)
      const storedReferralId = localStorage.getItem('referralId');
      if (storedReferralId) {
        setReferralInfo({
          referralId: storedReferralId,
          referrer: null
        });
      }
    }
  }, [location.state]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="flex flex-col items-center">
            <img src="/logo-letters-blue.svg" alt="clipchain" className="h-12 w-auto" />
          </Link>
        </div>
        
        {/* Header */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-sm text-gray-600">
            Join us to start organizing your video content
          </p>
        </div>

        {/* Referral Info */}
        {referralInfo && (
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {referralInfo.referrer ? (
                      <>Has sido invitado por <strong className="text-indigo-700">{referralInfo.referrer.displayName || referralInfo.referrer.username}</strong></>
                    ) : (
                      <>Registrándote con referral <strong className="text-indigo-700">{referralInfo.referralId}</strong></>
                    )}
                  </p>
                  {referralInfo.referrer && (
                    <p className="text-xs text-blue-600">@{referralInfo.referrer.username}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-8 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a unique username"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.username ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>



            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            {/* Links */}
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
