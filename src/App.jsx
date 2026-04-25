import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';
import BottomNavBar from './components/BottomNavBar';
import EmergencyView from './components/EmergencyView';
import HospitalPanelView from './components/HospitalPanelView';
import UserProfileView from './components/UserProfileView';
import AppointmentView from './components/AppointmentView';
import BackgroundAnimation from './components/BackgroundAnimation';
import { useEmergency } from './context/EmergencyContext';

function App() {
  const { syncStatus } = useEmergency();
  const [activeTab, setActiveTab] = useState('emergency');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans">
      
      {/* Animated Background Particles and Blobs */}
      <BackgroundAnimation />

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.1, rotateY: 180 }}
          className="relative w-12 h-12 flex items-center justify-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-45 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
          <Zap className="relative z-10 text-white fill-white" size={24} />
        </motion.div>
        <div className="flex flex-col -space-y-1">
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">RapidCare</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Emergency Network</span>
            <div className={`flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10`}>
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-red-500'}`} />
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{syncStatus === 'connected' ? 'Live' : 'Syncing'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {activeTab === 'emergency' && <EmergencyView />}
            {activeTab === 'hospitals' && <HospitalPanelView />}
            {activeTab === 'profile' && <UserProfileView />}
            {activeTab === 'booking' && <AppointmentView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;