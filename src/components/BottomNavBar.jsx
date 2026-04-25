import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Building2, UserCircle, CalendarRange } from 'lucide-react';

const BottomNavBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
    { id: 'booking', label: 'Booking', icon: CalendarRange },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-card flex items-center justify-around py-4 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 relative group py-1"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <tab.icon size={22} className={activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-blue-400 opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute -top-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
