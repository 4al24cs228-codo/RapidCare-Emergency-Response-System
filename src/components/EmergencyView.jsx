import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, CheckCircle2, Navigation, ShieldAlert, AlertTriangle, Loader2, Ambulance, Zap, Heart, Droplets, PenTool } from 'lucide-react';
import ECGWaveform from './ECGWaveform';
import { useEmergency } from '../context/EmergencyContext';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMERGENCY_TYPES = ["Accident", "Heart Attack", "Cardiac Arrest", "Trauma / Fall", "Breathing Issue", "Other"];

const EmergencyView = () => {
  const { 
    myRequestStatus, 
    initiateDiscovery, 
    triggerSOS, 
    expireCurrentRequest,
    transportType,
    setTransportType,
    sortedHospitals, 
    currentAttemptIndex,
    setCurrentAttemptIndex,
    acceptedHospitalCoords
  } = useEmergency();

  const [uiView, setUiView] = useState('idle'); // idle, preference, process
  const [phase, setPhase] = useState('analyzing'); // analyzing, sending, rerouting
  const [countdown, setCountdown] = useState(20);

  // Triage States
  const [bloodType, setBloodType] = useState('O+');
  const [emergencyType, setEmergencyType] = useState('Accident');
  const [otherDetail, setOtherDetail] = useState('');

  const startRescueSequence = (choice) => {
    setTransportType(choice);
    setUiView('process');
    setPhase('analyzing');
    
    setTimeout(() => {
      const hospitals = initiateDiscovery();
      setPhase('sending');
      // Pass triage data to SOS
      triggerSOS(0, hospitals, choice, {
        bloodType,
        emergencyType: emergencyType === 'Other' ? otherDetail : emergencyType
      });
      setCountdown(20);
    }, 2000);
  };

  useEffect(() => {
    let interval;
    if (uiView === 'process' && myRequestStatus === 'pending' && phase === 'sending' && countdown > 0) {
      interval = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } 
    
    if ((countdown === 0 || myRequestStatus === 'denied') && myRequestStatus !== 'accepted' && phase === 'sending') {
      handleReroute();
    }
    return () => clearInterval(interval);
  }, [uiView, myRequestStatus, phase, countdown]);

  const handleReroute = async () => {
    setPhase('rerouting');
    await expireCurrentRequest();
    
    const nextIndex = currentAttemptIndex + 1;
    if (nextIndex < sortedHospitals.length) {
      setTimeout(() => {
        setCurrentAttemptIndex(nextIndex);
        setPhase('sending');
        setCountdown(20);
        triggerSOS(nextIndex, sortedHospitals, transportType, {
           bloodType,
           emergencyType: emergencyType === 'Other' ? otherDetail : emergencyType
        });
      }, 2000);
    } else {
      setPhase('failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-8 animate-fade-in relative z-10">
      <div className="fixed inset-0 -z-10 flex items-center"><ECGWaveform /></div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-red-500 to-rose-300 bg-clip-text text-transparent italic">RAPIDCARE</h1>
        <p className="text-gray-500 font-black tracking-[0.4em] text-[10px] uppercase">Infrastructure Link: {myRequestStatus === 'accepted' ? 'SECURED' : 'ACTIVE SCAN'}</p>
      </div>

      <div className="w-full flex flex-col items-center">
        {uiView === 'idle' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUiView('preference')}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-[10px] border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.5)] flex items-center justify-center flex-col relative"
          >
            <span className="text-white text-7xl font-black italic tracking-tighter">SOS</span>
            <span className="text-red-200 mt-2 font-black tracking-widest text-[10px] uppercase">Initiate Tactical Link</span>
          </motion.button>
        )}

        {uiView === 'preference' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 w-full max-w-lg space-y-8 border-2 border-red-500/30">
             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter text-center">Triage Details</h3>
             
             <div className="space-y-6">
                {/* Blood Type Selector */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Droplets size={14} className="text-red-500" /> Select Blood Type
                   </label>
                   <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map(type => (
                        <button 
                          key={type}
                          onClick={() => setBloodType(type)}
                          className={`py-3 rounded-xl text-xs font-black transition-all border ${bloodType === type ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 border-white/10 text-gray-500'}`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Emergency Type Selector */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={14} className="text-yellow-500" /> Nature of Emergency
                   </label>
                   <select 
                     value={emergencyType}
                     onChange={(e) => setEmergencyType(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-500/30"
                   >
                      {EMERGENCY_TYPES.map(type => <option key={type} value={type} className="bg-black text-white">{type}</option>)}
                   </select>
                </div>

                {/* Conditional "Other" Input */}
                <AnimatePresence>
                  {emergencyType === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <PenTool size={14} className="text-blue-500" /> Describe Emergency
                       </label>
                       <input 
                         type="text"
                         value={otherDetail}
                         onChange={(e) => setOtherDetail(e.target.value)}
                         placeholder="Describe specifically..."
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-xs outline-none focus:border-blue-500/30"
                       />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-white/5 space-y-4">
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">Select Transport to Launch SOS</p>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => startRescueSequence('ambulance')} className="bg-red-600 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20">
                         <Ambulance size={20} /> Ambulance
                      </button>
                      <button onClick={() => startRescueSequence('self')} className="bg-white/5 text-white py-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">
                         <Zap size={20} className="text-yellow-500" /> Self-Drive
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {uiView === 'process' && (
          <div className="w-full max-w-md px-4">
             <motion.div className={`glass-card p-12 flex flex-col items-center text-center space-y-8 border-2 ${myRequestStatus === 'accepted' ? 'border-success shadow-[0_0_60px_rgba(34,197,94,0.3)]' : 'border-red-600'}`}>
                {myRequestStatus === 'accepted' ? (
                  <>
                    <div className="relative">
                       <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                       <CheckCircle2 size={80} className="text-success relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Request Accepted</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{acceptedHospitalCoords?.name} Responding</p>
                    
                    {transportType === 'self' ? (
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${acceptedHospitalCoords?.lat},${acceptedHospitalCoords?.lng}`)}
                        className="w-full bg-success text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-success/30 animate-pulse hover:scale-[1.02] transition-all"
                      >
                         <Navigation size={20} /> 📍 TRACK / NAVIGATE
                      </button>
                    ) : (
                      <div className="bg-success/10 border border-success/30 p-8 rounded-3xl w-full space-y-4">
                         <div className="flex justify-center gap-2">
                            <Ambulance className="text-success animate-bounce" size={40} />
                         </div>
                         <p className="text-success text-[12px] font-black uppercase tracking-[0.2em] leading-relaxed italic">Ambulance is en route. <br/><span className="text-white">Please stay put.</span></p>
                      </div>
                    )}
                  </>
                ) : phase === 'analyzing' ? (
                  <>
                    <Loader2 size={64} className="text-blue-500 animate-spin" />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Infrastructure Scan</h3>
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Sorting Nearest Trauma Nodes...</p>
                  </>
                ) : phase === 'rerouting' ? (
                  <>
                    <AlertTriangle size={64} className="text-yellow-500 animate-pulse" />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Node Saturated</h3>
                    <p className="text-yellow-500 text-[9px] font-black uppercase tracking-widest">Failover in Progress...</p>
                  </>
                ) : phase === 'failed' ? (
                  <>
                    <ShieldAlert size={64} className="text-red-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Network Error</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase">No response. Calling local authorities...</p>
                  </>
                ) : (
                  <>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                       <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full animate-ping" />
                       <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full" />
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                          <motion.circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-red-600" strokeDasharray={377} animate={{ strokeDashoffset: 377 - (377 * countdown / 20) }} transition={{ duration: 1, ease: 'linear' }} />
                       </svg>
                       <span className="text-3xl font-black text-white italic absolute">{countdown}</span>
                    </div>
                    <div>
                       <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-1">Attempt {currentAttemptIndex + 1}</p>
                       <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Pinging {sortedHospitals[currentAttemptIndex]?.name}</h3>
                       <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse mt-2 flex items-center justify-center gap-2">
                          <Zap size={12} className="fill-red-500" /> LIVE HANDSHAKE PENDING
                       </p>
                    </div>
                  </>
                )}
             </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyView;