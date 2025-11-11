import { useState } from 'react';
import { RefreshCw, Database, Cloud, Download } from 'lucide-react';
import usePosStore from '../stores/usePosStore';

export default function Settings() {
  const { isOnline, sync, syncStatus } = usePosStore();
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'http://localhost:3000/api');

  const handleSync = async () => {
    await sync();
  };

  const handleSaveApiUrl = () => {
    localStorage.setItem('apiUrl', apiUrl);
    alert('API URL saved!');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Sync Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Sync Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Connection Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Sync Status</p>
              <span className="text-sm font-medium capitalize">{syncStatus}</span>
            </div>

            <button
              onClick={handleSync}
              disabled={!isOnline || syncStatus === 'syncing'}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Manual Sync
            </button>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            API Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="http://localhost:3000/api"
              />
            </div>

            <button
              onClick={handleSaveApiUrl}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save API URL
            </button>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Information
          </h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>Local Database: SQLite</p>
            <p>Location: User Data Directory</p>
            <p>Sync Queue: Automatic when online</p>
          </div>
        </div>

        {/* Export/Import */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Data export and import features will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

