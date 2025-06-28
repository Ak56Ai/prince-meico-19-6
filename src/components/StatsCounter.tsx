import React, { useEffect, useState } from 'react';
import { Globe, Code, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

interface PlatformStat {
  id: string;
  stat_name: string;
  stat_value: number;
  description: string;
  updated_at: string;
}

const Counter: React.FC<CounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return (
    <span>{count}{suffix}</span>
  );
};

const StatsCounter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .order('stat_name');

      if (error) {
        console.error('Error fetching stats:', error);
        // Fallback to default stats if database fails
        setStats([
          { id: '1', stat_name: 'networks', stat_value: 7, description: 'Networks', updated_at: '' },
          { id: '2', stat_name: 'projects', stat_value: 5, description: 'Projects', updated_at: '' },
          { id: '3', stat_name: 'buyers', stat_value: 188, description: 'Buyers', updated_at: '' },
          { id: '4', stat_name: 'years_experience', stat_value: 1, description: 'Years of Experience', updated_at: '' }
        ]);
      } else {
        setStats(data || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback stats
      setStats([
        { id: '1', stat_name: 'networks', stat_value: 7, description: 'Networks', updated_at: '' },
        { id: '2', stat_name: 'projects', stat_value: 5, description: 'Projects', updated_at: '' },
        { id: '3', stat_name: 'buyers', stat_value: 188, description: 'Buyers', updated_at: '' },
        { id: '4', stat_name: 'years_experience', stat_value: 1, description: 'Years of Experience', updated_at: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'networks':
        return <Globe className="h-8 w-8" />;
      case 'projects':
        return <Code className="h-8 w-8" />;
      case 'buyers':
        return <Users className="h-8 w-8" />;
      case 'years_experience':
        return <Clock className="h-8 w-8" />;
      default:
        return <Globe className="h-8 w-8" />;
    }
  };

  const getStatLabel = (statName: string) => {
    switch (statName) {
      case 'networks':
        return 'Networks';
      case 'projects':
        return 'Projects';
      case 'buyers':
        return 'Buyers';
      case 'years_experience':
        return 'Years of Experience';
      default:
        return statName.charAt(0).toUpperCase() + statName.slice(1);
    }
  };

  const getStatSuffix = (statName: string) => {
    return statName === 'years_experience' ? '+' : '';
  };
  
  return (
    <section id="stats-section" className="py-20 relative bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div 
                key={stat.id} 
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/80 dark:bg-gray-800/80 mb-4 text-white group-hover:bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300">
                  {getStatIcon(stat.stat_name)}
                </div>
                
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {isVisible ? (
                    <Counter 
                      end={stat.stat_value} 
                      suffix={getStatSuffix(stat.stat_name)} 
                    />
                  ) : (
                    '0'
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {getStatLabel(stat.stat_name)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsCounter;