import React, { useState, useEffect } from 'react';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WalletConnect: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  // Auto-save user data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      saveUserToDatabase(address);
    }
  }, [isConnected, address]);

  const saveUserToDatabase = async (walletAddress: string) => {
    try {
      console.log('Saving user to database:', walletAddress);

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        return;
      }

      // If user doesn't exist, create new profile
      if (!existingUser) {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            wallet_address: walletAddress,
            name: null,
            email: null,
            location: null
          }])
          .select();

        if (error) {
          console.error('Error creating user profile:', error);
        } else {
          console.log('User profile created successfully:', data);
        }
      } else {
        console.log('User already exists in database:', existingUser);
      }
    } catch (error) {
      console.error('Error in saveUserToDatabase:', error);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    // Clear any local storage or session data if needed
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.store');
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium transition-all"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {shortenAddress(address)}
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  {shortenAddress(address)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                Connect a Wallet
              </div>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setIsOpen(false);
                  }}
                  disabled={isPending}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Wallet className="w-4 h-4 mr-3" />
                  {connector.name}
                  {isPending && (
                    <div className="ml-auto">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;