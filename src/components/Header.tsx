import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import LoginModal from './auth/LoginModal';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networksDropdownOpen, setNetworksDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  const location = useLocation();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openLoginModal = (mode: 'signin' | 'signup' | 'forgot') => {
    setLoginMode(mode);
    setLoginModalOpen(true);
  };

  return (
    <>
      <header className={`fixed w-full transition-all duration-300 z-50 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-3 shadow-lg border-b border-gray-200/20 dark:border-gray-700/20' 
          : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="MeICO Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                MeICO
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                <Link 
                  to="/" 
                  className={`transition-colors ${
                    isActive('/') 
                      ? 'text-purple-400' 
                      : isScrolled 
                        ? 'text-gray-900 dark:text-white hover:text-purple-400' 
                        : 'text-white hover:text-purple-400'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/active-ico" 
                  className={`transition-colors ${
                    isActive('/active-ico') 
                      ? 'text-purple-400' 
                      : isScrolled 
                        ? 'text-gray-900 dark:text-white hover:text-purple-400' 
                        : 'text-white hover:text-purple-400'
                  }`}
                >
                  Active ICO
                </Link>
                <Link 
                  to="/services" 
                  className={`transition-colors ${
                    isActive('/services') 
                      ? 'text-purple-400' 
                      : isScrolled 
                        ? 'text-gray-900 dark:text-white hover:text-purple-400' 
                        : 'text-white hover:text-purple-400'
                  }`}
                >
                  Services
                </Link>
                
                <div className="relative group">
                  <button 
                    onClick={() => setNetworksDropdownOpen(!networksDropdownOpen)}
                    className={`flex items-center transition-colors ${
                      isScrolled 
                        ? 'text-gray-900 dark:text-white hover:text-purple-400' 
                        : 'text-white hover:text-purple-400'
                    }`}
                  >
                    Networks <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${networksDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="py-1">
                      <Link to="/networks/ethereum" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Ethereum</Link>
                      <Link to="/networks/binance" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Binance</Link>
                      <Link to="/networks/coinbase" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Coinbase</Link>
                      <Link to="/networks/polygon" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Polygon</Link>
                      <Link to="/networks/arbitrum" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Arbitrum</Link>
                      <Link to="/networks/blast" className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">BLAST</Link>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to="/contact" 
                  className={`transition-colors ${
                    isActive('/contact') 
                      ? 'text-purple-400' 
                      : isScrolled 
                        ? 'text-gray-900 dark:text-white hover:text-purple-400' 
                        : 'text-white hover:text-purple-400'
                  }`}
                >
                  Contact Us
                </Link>
              </nav>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                {/* Auth Section */}
                {loading ? (
                  <div className="w-8 h-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium transition-all"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>

                    {userDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <Link
                              to="/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              Dashboard
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => openLoginModal('signin')}
                      className={`px-4 py-2 rounded-full transition-colors ${
                        isScrolled
                          ? 'text-gray-900 dark:text-white hover:text-purple-600'
                          : 'text-white hover:text-purple-400'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openLoginModal('signup')}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium transition-all transform hover:scale-105"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 ${
                  isScrolled 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-white'
                }`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md space-y-3 border-t border-gray-200/20 dark:border-gray-700/20">
            <Link to="/" className="block py-2 text-gray-900 dark:text-white">Home</Link>
            <Link to="/active-ico" className="block py-2 text-gray-900 dark:text-white">Active ICO</Link>
            <Link to="/services" className="block py-2 text-gray-900 dark:text-white">Services</Link>
            
            <div>
              <button 
                onClick={() => setNetworksDropdownOpen(!networksDropdownOpen)}
                className="flex items-center py-2 w-full text-gray-900 dark:text-white"
              >
                Networks <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className={`pl-4 space-y-1 transition-all duration-200 ${networksDropdownOpen ? 'block' : 'hidden'}`}>
                <Link to="/networks/ethereum" className="block py-1 text-sm text-gray-700 dark:text-gray-300">Ethereum</Link>
                <Link to="/networks/binance" className="block py-1 text-sm text-gray-700 dark:text-gray-300">Binance</Link>
                <Link to="/networks/coinbase" className="block py-1 text-sm text-gray-700 dark:text-gray-300">Coinbase</Link>
                <Link to="/networks/polygon" className="block py-1 text-sm text-gray-700 dark:text-gray-300">Polygon</Link>
                <Link to="/networks/arbitrum" className="block py-1 text-sm text-gray-700 dark:text-gray-300">Arbitrum</Link>
                <Link to="/networks/blast" className="block py-1 text-sm text-gray-700 dark:text-gray-300">BLAST</Link>
              </div>
            </div>
            
            <Link to="/contact" className="block py-2 text-gray-900 dark:text-white">Contact Us</Link>
            
            {user ? (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-900 dark:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 mt-4 mb-2">
                <button
                  onClick={() => openLoginModal('signin')}
                  className="flex-1 py-2 px-4 text-center rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openLoginModal('signup')}
                  className="flex-1 py-2 px-4 text-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        initialMode={loginMode}
      />
    </>
  );
};

export default Header;