import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, Globe, ExternalLink, Eye, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

const PricingPlans: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching featured projects...');

      // First, try to get featured projects from the featured_projects table
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

      console.log('Featured projects query result:', { featuredData, featuredError });

      if (featuredError) {
        console.log('Featured projects table query failed, trying direct projects query...');
        
        // Fallback: Get 3 most recent active projects directly
        const { data: recentData, error: recentError } = await supabase
          .from('ico_projects')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        console.log('Direct projects query result:', { recentData, recentError });

        if (recentError) {
          console.error('Direct projects query failed:', recentError);
          throw recentError;
        }
        
        setFeaturedProjects(recentData || []);
      } else {
        // Extract projects from the joined data
        const projects = featuredData
          ?.map(item => item.ico_projects)
          .filter(project => project !== null) as FeaturedProject[];
        
        console.log('Extracted featured projects:', projects);
        setFeaturedProjects(projects || []);
      }
    } catch (err) {
      console.error('Error fetching featured projects:', err);
      setError('Failed to load featured projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
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

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (!text) return 'Innovative blockchain project bringing cutting-edge solutions to the decentralized ecosystem.';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getSupplyInfo = (projectDetails: string) => {
    if (!projectDetails) return 'N/A';
    // Try to extract supply from project details
    const supplyMatch = projectDetails.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:tokens?|supply)/i);
    return supplyMatch ? supplyMatch[1] : 'N/A';
  };

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 dark:from-blue-900/20 dark:to-purple-900/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Projects</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover the most promising ICO projects handpicked by our team for exceptional potential and innovation.
            </p>
          </div>
          
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading featured projects...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur-xl opacity-80"></div>
              
              <div className="relative rounded-2xl p-1">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchFeaturedProjects}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 dark:from-blue-900/20 dark:to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Projects</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Discover the most promising ICO projects handpicked by our team for exceptional potential and innovation.
          </p>
        </div>
        
        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <div 
                key={`featured-project-${project.id}-${index}`}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-500 transform group-hover:scale-105 opacity-80"></div>
                
                <div className="relative h-full rounded-3xl p-1 transition-all duration-300 group-hover:scale-[1.01]">
                  <div className="h-full rounded-2xl bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                    
                    {/* Project Image with Overlays */}
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={project.image_url || 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                        alt={project.name} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Top Left Overlays */}
                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                          project.status === 'active' ? 'bg-green-500/90' :
                          project.status === 'upcoming' ? 'bg-blue-500/90' :
                          'bg-gray-500/90'
                        } backdrop-blur-sm`}>
                          {project.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                        
                        {project.network && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-purple-500/90 backdrop-blur-sm">
                            {project.network}
                          </span>
                        )}
                      </div>

                      {/* Tags on Image */}
                      {project.tags && (
                        <div className="absolute top-4 right-4 flex flex-wrap gap-1 max-w-[120px]">
                          {parseTags(project.tags).slice(0, 2).map((tag, tagIndex) => (
                            <span 
                              key={`tag-${project.id}-${tagIndex}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-black/50 text-white backdrop-blur-sm"
                            >
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Project Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {project.name}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`text-sm font-medium ${
                            project.status === 'active' ? 'text-green-600 dark:text-green-400' :
                            project.status === 'upcoming' ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Active'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Supply:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getSupplyInfo(project.project_details)}
                          </span>
                        </div>
                        
                        {project.ico_start_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Start Date:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(project.ico_start_date)}
                            </span>
                          </div>
                        )}
                        
                        {project.ico_end_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">End Date:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(project.ico_end_date)}
                            </span>
                          </div>
                        )}
                        
                        {project.launch_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {project.launch_price}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/project/${project.id}`}
                          className="flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-400 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        
                        {project.website_url && (
                          <a 
                            href={project.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-400 transition-colors text-sm"
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
                  <Clock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Featured Projects</h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    Featured projects will appear here soon. Check back later!
                  </p>
                  <Link
                    to="/active-ico"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all transform hover:scale-105"
                  >
                    Browse All Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* View All Projects Link */}
        {featuredProjects.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/active-ico"
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium transition-all transform hover:scale-105"
            >
              View All Projects
              <ExternalLink className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingPlans;