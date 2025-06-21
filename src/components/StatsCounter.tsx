import React, { useEffect, useState } from 'react';
import { Globe, Code, Users, Clock } from 'lucide-react';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
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
  
  const stats = [
    {
      icon: <Globe className="h-8 w-8" />,
      value: 7,
      label: 'Networks',
      suffix: ''
    },
    {
      icon: <Code className="h-8 w-8" />,
      value: 5,
      label: 'Projects',
      suffix: ''
    },
    {
      icon: <Users className="h-8 w-8" />,
      value: 188,
      label: 'Buyers',
      suffix: ''
    },
    {
      icon: <Clock className="h-8 w-8" />,
      value: 1,
      label: 'Years of Experience',
      suffix: '+'
    }
  ];
  
  return (
    <section id="stats-section" className="py-20 relative bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/80 dark:bg-gray-800/80 mb-4 text-white group-hover:bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300">
                {stat.icon}
              </div>
              
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {isVisible ? <Counter end={stat.value} suffix={stat.suffix} /> : '0'}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;