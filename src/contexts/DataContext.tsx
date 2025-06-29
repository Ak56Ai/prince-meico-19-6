import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
  token_address: string;
  created_at: string;
}

interface PlatformStat {
  id: string;
  stat_name: string;
  stat_value: number;
  description: string;
  updated_at: string;
}

interface FeaturedProject {
  id: string;
  name: string;
  description: string;
  image_url: string;
  status: 'active' | 'upcoming' | 'completed';
  website_url: string;
  launch_date: string;
  ticker: string;
  tags: string;
  network: string;
  ico_start_date: string;
  ico_end_date: string;
  launch_price: string;
  project_details: string;
  token_address: string;
}

interface DataContextType {
  // Data
  projects: IcoProject[];
  featuredProjects: FeaturedProject[];
  stats: PlatformStat[];
  
  // Loading states
  projectsLoading: boolean;
  featuredLoading: boolean;
  statsLoading: boolean;
  
  // Functions
  refreshProjects: () => Promise<void>;
  refreshFeaturedProjects: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Data states
  const [projects, setProjects] = useState<IcoProject[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [stats, setStats] = useState<PlatformStat[]>([]);
  
  // Loading states
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Cache keys
  const CACHE_KEYS = {
    projects: 'cached_projects',
    featured: 'cached_featured_projects',
    stats: 'cached_stats',
    lastFetch: 'last_fetch_time'
  };

  // Check if data should be refreshed (only on browser refresh)
  const shouldRefreshData = () => {
    const lastFetch = localStorage.getItem(CACHE_KEYS.lastFetch);
    const sessionStart = sessionStorage.getItem('session_start');
    
    // If no session start time, this is a new session (browser refresh)
    if (!sessionStart) {
      sessionStorage.setItem('session_start', Date.now().toString());
      return true;
    }
    
    return false;
  };

  // Load cached data immediately
  const loadCachedData = () => {
    try {
      const cachedProjects = localStorage.getItem(CACHE_KEYS.projects);
      const cachedFeatured = localStorage.getItem(CACHE_KEYS.featured);
      const cachedStats = localStorage.getItem(CACHE_KEYS.stats);

      if (cachedProjects) {
        setProjects(JSON.parse(cachedProjects));
      }
      if (cachedFeatured) {
        setFeaturedProjects(JSON.parse(cachedFeatured));
      }
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  // Fetch projects from database
  const fetchProjects = async (): Promise<IcoProject[]> => {
    const { data, error } = await supabase
      .from('ico_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Fetch featured projects from database
  const fetchFeaturedProjects = async (): Promise<FeaturedProject[]> => {
    // Try to get featured projects from the featured_projects table
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_projects')
      .select(`
        project_id,
        ico_projects (
          id,
          name,
          description,
          image_url,
          status,
          website_url,
          launch_date,
          ticker,
          tags,
          network,
          ico_start_date,
          ico_end_date,
          launch_price,
          project_details,
          token_address
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(3);

    if (featuredError || !featuredData || featuredData.length === 0) {
      // Fallback: Get 3 most recent active projects
      const { data: recentData, error: recentError } = await supabase
        .from('ico_projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentError) throw recentError;
      return recentData || [];
    }

    // Extract projects from the joined data
    return featuredData
      ?.map(item => item.ico_projects)
      .filter(project => project !== null) as FeaturedProject[] || [];
  };

  // Fetch stats from database
  const fetchStats = async (): Promise<PlatformStat[]> => {
    const { data, error } = await supabase
      .from('platform_stats')
      .select('*')
      .order('stat_name');

    if (error) throw error;
    return data || [];
  };

  // Refresh functions
  const refreshProjects = async () => {
    setProjectsLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      localStorage.setItem(CACHE_KEYS.projects, JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const refreshFeaturedProjects = async () => {
    setFeaturedLoading(true);
    try {
      const data = await fetchFeaturedProjects();
      setFeaturedProjects(data);
      localStorage.setItem(CACHE_KEYS.featured, JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing featured projects:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const refreshStats = async () => {
    setStatsLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
      localStorage.setItem(CACHE_KEYS.stats, JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      refreshProjects(),
      refreshFeaturedProjects(),
      refreshStats()
    ]);
    localStorage.setItem(CACHE_KEYS.lastFetch, Date.now().toString());
  };

  // Initialize data on mount
  useEffect(() => {
    // Load cached data immediately
    loadCachedData();
    
    // Only fetch fresh data if this is a browser refresh
    if (shouldRefreshData()) {
      console.log('🔄 Browser refresh detected, fetching fresh data...');
      refreshAllData();
    } else {
      console.log('📱 Using cached data for better performance');
    }
  }, []);

  const value: DataContextType = {
    // Data
    projects,
    featuredProjects,
    stats,
    
    // Loading states
    projectsLoading,
    featuredLoading,
    statsLoading,
    
    // Functions
    refreshProjects,
    refreshFeaturedProjects,
    refreshStats,
    refreshAllData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};