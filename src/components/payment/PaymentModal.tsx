import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'silver' | 'gold';
}

interface CurrencyRate {
  symbol: string;
  name: string;
  rate: number; // Rate in terms of MeCoin
  icon: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planType }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('MECOIN');
  const [amount, setAmount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fixed rates for demonstration - in production, fetch from API
  const currencyRates: CurrencyRate[] = [
    { symbol: 'MECOIN', name: 'MeCoin', rate: 1, icon: '🪙' },
    { symbol: 'MEUSD', name: 'MeUSD', rate: 0.022, icon: '💵' },
    { symbol: 'USDT', name: 'Tether USD', rate: 0.022, icon: '₮' },
    { symbol: 'POL', name: 'Polygon', rate: 0.045, icon: '🔷' },
  ];

  const planAmounts = {
    silver: 100,
    gold: 500
  };

  const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e";

  useEffect(() => {
    if (isOpen) {
      setAmount(planAmounts[planType]);
    }
  }, [isOpen, planType]);

  const calculateConversion = (mecoinAmount: number, targetCurrency: string) => {
    const rate = currencyRates.find(c => c.symbol === targetCurrency)?.rate || 1;
    return (mecoinAmount * rate).toFixed(6);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upgrade to {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Plan Details */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {planType === 'silver' ? 'Silver Plan' : 'Gold Plan'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Required: {planAmounts[planType]} MeCoin
              </p>
            </div>

            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Payment Currency
              </label>
              <div className="grid grid-cols-2 gap-3">
                {currencyRates.map((currency) => (
                  <button
                    key={currency.symbol}
                    onClick={() => setSelectedCurrency(currency.symbol)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedCurrency === currency.symbol
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{currency.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currency.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversion Display */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">You need to send:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {calculateConversion(amount, selectedCurrency)} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Equivalent to:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {amount} MeCoin
                </span>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Send {selectedCurrency} to this address:
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
                  {walletAddress}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  title="Copy address"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Address copied to clipboard!
                </p>
              )}
            </div>

            {/* Rate Table */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Exchange Rates (1 MeCoin =)
              </h5>
              <div className="space-y-2">
                {currencyRates.map((currency) => (
                  <div key={currency.symbol} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="flex items-center space-x-2">
                      <span>{currency.icon}</span>
                      <span className="text-sm font-medium">{currency.symbol}</span>
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currency.rate} {currency.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Send exactly {calculateConversion(amount, selectedCurrency)} {selectedCurrency} to the address above</li>
                    <li>Your account will be upgraded within 10-15 minutes after confirmation</li>
                    <li>Contact support if you don't see the upgrade after 30 minutes</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Here you would typically mark the payment as pending
                  // and start monitoring for the transaction
                  alert('Payment instructions noted. Please send the payment and wait for confirmation.');
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all"
              >
                I've Sent Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;