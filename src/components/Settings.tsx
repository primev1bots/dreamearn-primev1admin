import React, { useState, useEffect } from 'react'; 
import { ref, set, onValue } from 'firebase/database'; 
import { database } from '../firebase'; 
import { FaTrash, FaImages, FaArrowUp, FaArrowDown, FaPercentage, FaMoneyBillWave } from 'react-icons/fa'; 

interface AppConfig {
  logoUrl: string;
  appName: string;
  sliderImages: SliderImage[];
  supportUrl: string;
  tutorialVideoId: string;
  referralCommission: ReferralCommission;
}

interface SliderImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  createdAt: string;
}

interface ReferralCommission {
  enabled: boolean;
  commissionRate: number; // Percentage
  minWithdrawal: number;
  currency: string;
  levels: CommissionLevel[];
}

interface CommissionLevel {
  level: number;
  rate: number;
  description: string;
}

const AdminPanel: React.FC = () => {
  const [appConfig, setAppConfig] = useState<AppConfig>({
    logoUrl: "",
    appName: "",
    sliderImages: [],
    supportUrl: "",
    tutorialVideoId: "",
    referralCommission: {
      enabled: false,
      commissionRate: 10,
      minWithdrawal: 10,
      currency: "USDT",
      levels: [
        { level: 1, rate: 10, description: "Direct Referral" },
        { level: 2, rate: 5, description: "Second Level" },
        { level: 3, rate: 2, description: "Third Level" }
      ]
    }
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  useEffect(() => {
    console.log('AdminPanel: Starting Firebase connection...');
    
    try {
      const configRef = ref(database, 'appConfig');
      console.log('AdminPanel: Firebase ref created', configRef);
      
      const unsubscribe = onValue(configRef, (snapshot) => {
        console.log('AdminPanel: Firebase data received', snapshot.val());
        const data = snapshot.val();
        if (data) {
          setAppConfig({
            logoUrl: data.logoUrl || "",
            appName: data.appName || "",
            sliderImages: data.sliderImages || [],
            supportUrl: data.supportUrl || "",
            tutorialVideoId: data.tutorialVideoId || "",
            referralCommission: data.referralCommission || {
              enabled: false,
              commissionRate: 10,
              minWithdrawal: 10,
              currency: "USDT",
              levels: [
                { level: 1, rate: 10, description: "Direct Referral" },
                { level: 2, rate: 5, description: "Second Level" },
                { level: 3, rate: 2, description: "Third Level" }
              ]
            }
          });
        } else {
          console.log('AdminPanel: No data found in Firebase, using defaults');
        }
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('AdminPanel: Firebase read error:', error);
        setError(`Firebase Error: ${error.message}`);
        setLoading(false);
      });

      return () => {
        console.log('AdminPanel: Cleaning up Firebase listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('AdminPanel: Setup error:', err);
      setError(`Setup Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // ... (keep all your existing functions like uploadToCloudinary, handleLogoUpload, etc.)

  const handleReferralCommissionUpdate = async () => {
    try {
      await set(ref(database, 'appConfig'), appConfig);
      setMessage("Referral commission settings updated successfully!");
    } catch (error) {
      console.error("Error updating referral commission:", error);
      const errorMessage = error instanceof Error ? error.message : "Error updating referral commission. Please try again.";
      setMessage(errorMessage);
      setError(errorMessage);
    }
  };

  const handleCommissionRateChange = (value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      setAppConfig(prev => ({
        ...prev,
        referralCommission: {
          ...prev.referralCommission,
          commissionRate: rate
        }
      }));
    }
  };

  const handleMinWithdrawalChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0) {
      setAppConfig(prev => ({
        ...prev,
        referralCommission: {
          ...prev.referralCommission,
          minWithdrawal: amount
        }
      }));
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setAppConfig(prev => ({
      ...prev,
      referralCommission: {
        ...prev.referralCommission,
        currency
      }
    }));
  };

  const handleLevelRateChange = (levelIndex: number, rate: string) => {
    const newRate = parseFloat(rate);
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      const updatedLevels = [...appConfig.referralCommission.levels];
      updatedLevels[levelIndex] = {
        ...updatedLevels[levelIndex],
        rate: newRate
      };
      
      setAppConfig(prev => ({
        ...prev,
        referralCommission: {
          ...prev.referralCommission,
          levels: updatedLevels
        }
      }));
    }
  };

  const handleLevelDescriptionChange = (levelIndex: number, description: string) => {
    const updatedLevels = [...appConfig.referralCommission.levels];
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      description
    };
    
    setAppConfig(prev => ({
      ...prev,
      referralCommission: {
        ...prev.referralCommission,
        levels: updatedLevels
      }
    }));
  };

  const addCommissionLevel = () => {
    const currentLevels = appConfig.referralCommission.levels;
    const newLevel = {
      level: currentLevels.length + 1,
      rate: 1,
      description: `Level ${currentLevels.length + 1}`
    };
    
    setAppConfig(prev => ({
      ...prev,
      referralCommission: {
        ...prev.referralCommission,
        levels: [...currentLevels, newLevel]
      }
    }));
  };

  const removeCommissionLevel = (levelIndex: number) => {
    if (appConfig.referralCommission.levels.length <= 1) {
      setMessage("At least one commission level is required!");
      return;
    }
    
    const updatedLevels = appConfig.referralCommission.levels
      .filter((_, index) => index !== levelIndex)
      .map((level, index) => ({
        ...level,
        level: index + 1
      }));
    
    setAppConfig(prev => ({
      ...prev,
      referralCommission: {
        ...prev.referralCommission,
        levels: updatedLevels
      }
    }));
  };

  const toggleCommissionSystem = () => {
    setAppConfig(prev => ({
      ...prev,
      referralCommission: {
        ...prev.referralCommission,
        enabled: !prev.referralCommission.enabled
      }
    }));
  };

  // Loading state (keep your existing loading state)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Error state (keep your existing error state)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Admin Panel</h1>
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Debug Info */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 text-sm">
            DB Connected: {database ? 'Yes' : 'No'}<br />
          </p>
        </div>

        {/* Referral Commission Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-300 flex items-center">
              <FaMoneyBillWave className="mr-2" />
              Referral Commission System
            </h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm">Enable System:</span>
              <button
                onClick={toggleCommissionSystem}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  appConfig.referralCommission.enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    appConfig.referralCommission.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Commission Rate (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={appConfig.referralCommission.commissionRate}
                  onChange={(e) => handleCommissionRateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <FaPercentage className="absolute right-3 top-2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Withdrawal:
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={appConfig.referralCommission.minWithdrawal}
                onChange={(e) => handleMinWithdrawalChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Currency:
              </label>
              <select
                value={appConfig.referralCommission.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {/* Multi-Level Commission */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-300">Multi-Level Commission</h3>
              <button
                onClick={addCommissionLevel}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Add Level
              </button>
            </div>

            <div className="space-y-3">
              {appConfig.referralCommission.levels.map((level, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Level {level.level}:</label>
                      <div className="text-sm text-gray-300 bg-gray-600 px-3 py-2 rounded">
                        Level {level.level}
                      </div>
                    </div>
                    
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium mb-1">Description:</label>
                      <input
                        type="text"
                        value={level.description}
                        onChange={(e) => handleLevelDescriptionChange(index, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Direct Referral"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1">Commission Rate (%):</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={level.rate}
                          onChange={(e) => handleLevelRateChange(index, e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FaPercentage className="absolute right-3 top-2 text-gray-400" />
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end space-x-2">
                      {appConfig.referralCommission.levels.length > 1 && (
                        <button
                          onClick={() => removeCommissionLevel(index)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReferralCommissionUpdate}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Update Commission Settings
          </button>
        </div>

        {/* Commission Preview */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">Commission Preview</h3>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {appConfig.referralCommission.commissionRate}%
                </div>
                <div className="text-sm text-gray-300">Default Rate</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {appConfig.referralCommission.minWithdrawal} {appConfig.referralCommission.currency}
                </div>
                <div className="text-sm text-gray-300">Min Withdrawal</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {appConfig.referralCommission.levels.length}
                </div>
                <div className="text-sm text-gray-300">Commission Levels</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {appConfig.referralCommission.enabled ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-300">System Status</div>
              </div>
            </div>
            
            {/* Levels Preview */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2 text-green-300">Commission Levels:</h4>
              <div className="space-y-2">
                {appConfig.referralCommission.levels.map((level, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded">
                    <span className="text-sm">{level.description}</span>
                    <span className="text-green-400 font-semibold">{level.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ... (keep all your existing sections: Logo Upload, Slider Images, App Name, Support & Tutorial) */}

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-md mb-4 ${
            message.includes('Error') ? 'bg-red-500' : 'bg-green-500'
          }`}>
            <div className="flex items-center">
              {message.includes('Error') ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
