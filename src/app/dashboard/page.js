'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Add EditModal component
function EditModal({ isOpen, onClose, apiKey, onSave }) {
  const [name, setName] = useState(apiKey?.name || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6">Edit API key</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Enter a new name for the API key.
        </p>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <span className="font-medium">Key Name</span>
              <span className="text-gray-500">— A unique name to identify this key</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter key name"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => onSave(name)}
            className="px-8 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Add DeleteModal component
function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6">Remove API key</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Are you sure you want to remove this API key? This action cannot be undone.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-8 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Add CreateKeyModal component
function CreateKeyModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6">Create API key</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Enter a name for your new API key.
        </p>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <span className="font-medium">Key Name</span>
              <span className="text-gray-500">— A unique name to identify this key</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter key name"
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => {
              if (name.trim()) {
                onSave(name);
                setName('');
              }
            }}
            className="px-8 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => {
              onClose();
              setName('');
            }}
            className="px-8 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Add this test function
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('api_keys').select('count');
    
    if (error) {
      console.error('Connection test error:', error);
      return;
    }
    
    console.log('Connection successful:', data);
  } catch (err) {
    console.error('Test failed:', err);
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      // Get hash parameters if they exist
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // If we have an access token, set the session
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token')
        });
        // Clear the hash without triggering a reload
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Verify session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    handleAuth();
  }, [router]);

  useEffect(() => {
    checkUser();
    fetchApiKeys();
    testConnection();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login'); // Redirect to login if no user
    }
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchApiKeys = async () => {
    try {
      // Simple test query first
      const { data: testData, error: testError } = await supabase
        .from('api_keys')
        .select('id')
        .limit(1);

      console.log('Test query result:', { testData, testError });

      if (testError) throw testError;

      // If test succeeds, do the full query
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Detailed error:', error);
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (name) => {
    try {
      const newKey = `tvly-${generateRandomString(32)}`;
      const { data, error } = await supabase
        .from('api_keys')
        .insert([
          {
            name,
            key: newKey,
            usage: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setApiKeys([data, ...apiKeys]);
      setCreateModalOpen(false);
      toast.success('API key created successfully');
    } catch (error) {
      toast.error('Failed to create API key');
      console.error('Error:', error);
    }
  };

  const handleSaveEdit = async (newName) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ name: newName })
        .eq('id', selectedKey.id);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === selectedKey.id ? { ...key, name: newName } : key
      ));
      setEditModalOpen(false);
      setSelectedKey(null);
      toast.success('API key updated successfully');
    } catch (error) {
      toast.error('Failed to update API key');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update UI
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      // Use red toast for deletion
      toast.error('API key deleted successfully', {
        style: {
          background: '#EF4444', // Red background
          color: 'white'        // White text
        }
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete API key');
    }
  };

  const confirmDelete = async () => {
    if (!keyToDelete) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyToDelete.id);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete.id));
      toast.success('API key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete API key');
      console.error('Error:', error);
    } finally {
      setDeleteModalOpen(false);
      setKeyToDelete(null);
    }
  };

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleEdit = (apiKey) => {
    setSelectedKey(apiKey);
    setEditModalOpen(true);
  };

  const handleView = (apiKey) => {
    setSelectedKey(apiKey);
    setViewModalOpen(true);
  };

  const handleCopy = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setRevealedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const formatApiKey = (key, isRevealed) => {
    if (isRevealed) {
      return key;
    }
    // Show first 'tvly-' and mask the rest
    return `tvly-${'*'.repeat(32)}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Pages / Overview</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Operational</span>
              </div>
              {user && (
                <>
                  <span className="text-sm">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Card */}
        <div className="rounded-lg p-6 mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          <div className="flex justify-between items-start text-white">
            <div>
              <div className="text-sm font-medium mb-2">CURRENT PLAN</div>
              <h2 className="text-3xl font-bold mb-4">Researcher</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>API Limit</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-sm">0 / 1,000 Requests</div>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="text-blue-500 hover:text-blue-600"
              title="Create new API key"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{apiKey.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{apiKey.usage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      tvly-{revealedKeys.has(apiKey.id) 
                        ? apiKey.key.slice(5) // Show everything after 'tvly-'
                        : '*'.repeat(32)} {/* 32 asterisks to match key length */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleKeyVisibility(apiKey.id)} 
                          className="text-gray-500 hover:text-gray-700"
                          title={revealedKeys.has(apiKey.id) ? "Hide API key" : "Show API key"}
                        >
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            {revealedKeys.has(apiKey.id) ? (
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            ) : (
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            )}
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleCopy(apiKey.key)} 
                          className="text-gray-500 hover:text-gray-700" 
                          title="Copy"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEdit(apiKey)} 
                          className="text-gray-500 hover:text-gray-700" 
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(apiKey.id)} 
                          className="text-gray-500 hover:text-gray-700" 
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedKey(null);
        }}
        apiKey={selectedKey}
        onSave={handleSaveEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setKeyToDelete(null);
        }}
        onConfirm={confirmDelete}
      />

      <CreateKeyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateKey}
      />
    </div>
  );
} 