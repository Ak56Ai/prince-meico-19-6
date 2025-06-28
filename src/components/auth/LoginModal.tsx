import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signin') {
        console.log('Attempting sign in for:', formData.email);
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        setMessage('Successfully signed in!');
        setMessageType('success');
        setTimeout(() => onClose(), 1000);
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.acceptTerms) {
          throw new Error('Please accept the terms and conditions');
        }
        
        console.log('Attempting sign up for:', formData.email, 'with name:', formData.name);
        
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name.trim() || null
        });
        
        if (error) throw error;
        
        setMessage('Account created successfully! Please check your email for verification.');
        setMessageType('success');
        
        // Clear form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          acceptTerms: false
        });
      } else if (mode === 'forgot') {
        console.log('Attempting password reset for:', formData.email);
        const { error } = await resetPassword(formData.email);
        if (error) throw error;
        setMessage('Password reset email sent! Check your inbox.');
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setMessage(error.message || 'An error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <a href="/terms-of-use" className="text-purple-600 hover:text-purple-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" className="text-purple-600 hover:text-purple-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all transform hover:scale-105 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Email'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => setMode('forgot')}
                    className="text-purple-600 hover:text-purple-500 text-sm"
                  >
                    Forgot your password?
                  </button>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-purple-600 hover:text-purple-500 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-purple-600 hover:text-purple-500 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-purple-600 hover:text-purple-500 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;