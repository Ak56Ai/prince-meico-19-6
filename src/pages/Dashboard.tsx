import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { User, FolderOpen, Edit, Plus, ExternalLink, Calendar, Tag, Globe, Twitter, Send, Facebook, Linkedin, Eye, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  location: string;
  created_at: string;
}

interface IcoProject {
  id: string;
  name: string;
  description: string;
  image_url: string;
  status: 'active' | 'upcoming' | 'completed';
  website_url: string;
  whitepaper_url: string;
  launch_date: string;
  ticker: string;
  tags: string;
  block_explorer: string;
  twitter: string;
  telegram: string;
  facebook: string;
  linkedin: string;
  created_at: string;
}

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<IcoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    location: ''
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    }
  }, [isConnected, address]);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      
      console.log('Fetching user data for address:', address);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', address)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      console.log('Profile data:', profileData);

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          location: profileData.location || ''
        });
      } else {
        // Create profile if it doesn't exist
        await createInitialProfile();
      }

      // Fetch user projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('ico_projects')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      console.log('Projects data:', projectsData);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    if (!address) return;

    try {
      console.log('Creating initial profile for:', address);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          wallet_address: address,
          name: null,
          email: null,
          location: null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating initial profile:', error);
      } else {
        console.log('Initial profile created:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createInitialProfile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      setSaving(true);
      setMessage('');

      console.log('Updating profile for address:', address, 'with data:', profileForm);

      const profileData = {
        name: profileForm.name.trim() || null,
        email: profileForm.email.trim() || null,
        location: profileForm.location.trim() || null
      };

      if (profile) {
        // Update existing profile
        console.log('Updating existing profile...');
        const { data, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('wallet_address', address)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Profile updated successfully:', data);
        setProfile(data);
      } else {
        // Create new profile
        console.log('Creating new profile...');
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            wallet_address: address,
            ...profileData
          }])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Profile created successfully:', data);
        setProfile(data);
      }

      setEditingProfile(false);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(`Failed to update profile: ${error.message || 'Please try again.'}`);
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const parseTags = (tags: string) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black pt-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
              
              <div className="relative rounded-2xl p-1">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Access</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Please connect your wallet to access your dashboard and manage your profile and projects.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Your wallet connection is secure and your data is protected.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black pt-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
              
              <div className="relative rounded-2xl p-1">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile?.name || 'Anonymous User'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    {profile?.email && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        {profile.email}
                      </p>
                    )}
                  </div>
                  
                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'profile'
                          ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Profile
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'projects'
                          ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <FolderOpen className="w-5 h-5 mr-3" />
                      Your Projects ({projects.length})
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeTab === 'profile' && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
                
                <div className="relative rounded-2xl p-1">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                      <button
                        onClick={() => setEditingProfile(!editingProfile)}
                        className="flex items-center px-4 py-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 dark:text-purple-400 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {editingProfile ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {message && (
                      <div className={`mb-6 p-4 rounded-lg ${
                        messageType === 'success'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' 
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                      }`}>
                        {message}
                      </div>
                    )}

                    {editingProfile ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                          <input
                            type="text"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your location"
                          />
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all transform hover:scale-105 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProfile(false)}
                            className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Wallet Address</label>
                          <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            {address}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                          <p className="text-gray-900 dark:text-white">{profile?.name || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                          <p className="text-gray-900 dark:text-white">{profile?.email || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                          <p className="text-gray-900 dark:text-white">{profile?.location || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Member Since</label>
                          <p className="text-gray-900 dark:text-white">{profile ? formatDate(profile.created_at) : 'New user'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
                  <span className="text-gray-600 dark:text-gray-400">{projects.length} project(s)</span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-80 group-hover:opacity-100"></div>
                        
                        <div className="relative rounded-2xl p-1">
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={project.image_url || 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                                alt={project.name} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-4 left-4 flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                                  project.status === 'active' ? 'bg-green-500/90' :
                                  project.status === 'upcoming' ? 'bg-blue-500/90' :
                                  'bg-gray-500/90'
                                } backdrop-blur-sm`}>
                                  {project.status}
                                </span>
                                {project.ticker && (
                                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-purple-500/90 backdrop-blur-sm">
                                    {project.ticker}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h3>
                                {project.launch_date && (
                                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(project.launch_date)}
                                  </div>
                                )}
                              </div>

                              {project.tags && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {parseTags(project.tags).slice(0, 3).map((tag, index) => (
                                    <span 
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                                {project.description?.length > 100 
                                  ? `${project.description.substring(0, 100)}...` 
                                  : project.description || 'No description available'}
                              </p>
                              
                              <div className="flex flex-wrap gap-3">
                                <Link
                                  to={`/project/${project.id}`}
                                  className="flex items-center px-3 py-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 dark:text-purple-400 transition-colors text-sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                                {project.website_url && (
                                  <a 
                                    href={project.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-3 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 transition-colors text-sm"
                                  >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Website
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
                      
                      <div className="relative rounded-2xl p-1">
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-12">
                          <Plus className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Projects Yet</h3>
                          <p className="text-gray-500 dark:text-gray-500 mb-6">Start by creating your first ICO project.</p>
                          <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;