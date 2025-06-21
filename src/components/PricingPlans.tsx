import React from 'react';
import { ArrowRight } from 'lucide-react';

const PricingPlans: React.FC = () => {
  const plans = [
    {
      title: 'Base Plan',
      price: 'FREE',
      description: 'Harness the power of the entire EVM ecosystem with a seamless, user-friendly app designed for creators and investors. Your blockchain journey begins here!',
      icon: '🚀'
    },
    {
      title: 'Silver Plan',
      price: '100 MeCoin',
      description: 'With support for every chain in the EVM ecosystem, our platform empowers projects to scale and investors to diversify effortlessly. Join the decentralized revolution today!',
      icon: '✨'
    },
    {
      title: 'Gold Plan',
      price: '500 MeCoin',
      description: 'Simplify your ICO experience with full compatibility across EVM chains. From seamless token launches to strategic investments, our app bridges innovation and opportunity on every blockchain.',
      icon: '💎'
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 dark:from-blue-900/20 dark:to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-500 transform group-hover:scale-105 opacity-80"></div>
              
              <div className="relative h-full rounded-3xl p-1 transition-all duration-300 group-hover:scale-[1.01]">
                <div className="h-full p-8 rounded-2xl bg-gray-900/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/10 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                      <div className="mt-1 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        {plan.price}
                      </div>
                    </div>
                    <div className="text-4xl">{plan.icon}</div>
                  </div>
                  
                  <p className="text-gray-300 mb-8 flex-grow">
                    {plan.description}
                  </p>
                  
                  <a 
                    href="#" 
                    className="mt-auto inline-flex items-center justify-center px-5 py-3 rounded-full group-hover:bg-gradient-to-r from-purple-600 to-blue-500 bg-white/10 text-white font-medium transition-all"
                  >
                    List Now
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;