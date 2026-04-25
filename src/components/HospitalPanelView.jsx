import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Building2, UserCircle, Activity, Check, X, FileText, Navigation, Clock, Ambulance, Lock, Eye, Zap } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { hospitalDatabase } from '../data/hospitalStore';

const HospitalPanelView = () => {
  const { activeEmergency, acceptEmergency, rejectEmergency, currentHospital, setCurrentHospital, bookings, updateBookingStatus } = useEmergency();
  const [isAuthView, setIsAuthView] = useState(false);
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [activeTab, setActiveTab] = useState('emergency');
  const [countdown, setCountdown] = useState(20);
  const [showDossier, setShowDossier] = useState(false);

  // Precision Timer Sync
  useEffect(() => {
    let interval;
    if (activeEmergency?.status === 'pending' && activeEmergency?.targetHospitalId === currentHospital?.id) {
      const startTime = activeEmergency.timestamp;
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = 20 - elapsed;
        if (remaining <= 0) { setCountdown(0); clearInterval(interval); } else { setCountdown(remaining); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEmergency, currentHospital]);

  const handleLogin = (e) => {
    e.preventDefault();
    const hospital = hospitalDatabase.find(h => h.id.trim() === formData.id.trim() && h.password === formData.password);
    if (hospital) { setCurrentHospital(hospital); setIsAuthView(false); } else { alert("Encryption Error: Invalid Node ID"); }
  };

  const isAccepted = activeEmergency?.status === 'accepted';

  const handleTrackPatient = () => {
    if (activeEmergency?.userLat && activeEmergency?.userLng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeEmergency.userLat},${activeEmergency.userLng}`);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      
      {/* 1. COMMAND HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
              {currentHospital ? `${currentHospital.name} HQ` : "Trauma Node Portal"}
            </h2>
            <p className="text-blue-500 font-bold text-[9px] uppercase tracking-[0.3em] mt-2 italic">Infrastructure Secure: {currentHospital ? 'VERIFIED' : 'OFFLINE'}</p>
          </div>
          {currentHospital && (
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('emergency')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'emergency' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-500'}`}>Trauma</button>
                <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500'}`}>Booking</button>
             </div>
          )}
        </div>
        {currentHospital ? (
          <button onClick={() => setCurrentHospital(null)} className="text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Terminate</button>
        ) : (
          <button onClick={() => setIsAuthView(true)} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all">Node Access</button>
        )}
      </div>

      {!currentHospital ? (
        <div className="text-center py-32 glass-card border border-white/5 opacity-40">
           <Building2 className="text-gray-800 mx-auto mb-6" size={80} />
           <p className="text-gray-500 font-black uppercase tracking-[0.6em] text-xs">Awaiting Trauma Node Authorization</p>
        </div>
      ) : activeTab === 'emergency' ? (
        /* EMERGENCY HUD */
        <div className="space-y-10">
          <div className="space-y-6">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] italic px-2">Secure Signal Channel</h3>
             <AnimatePresence mode="wait">
                {activeEmergency && activeEmergency.targetHospitalId === currentHospital.id && (activeEmergency.status === 'pending' || isAccepted) && (countdown > 0 || isAccepted) ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`glass-card border-2 relative overflow-hidden ${activeEmergency.status === 'pending' ? 'border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.2)]' : 'border-success/30'}`}>
                     
                     {activeEmergency.status === 'pending' && (
                        <div className="absolute top-10 right-10 flex flex-col items-center">
                           <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                 <motion.circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-red-600" strokeDasharray={176} animate={{ strokeDashoffset: 176 - (176 * countdown / 20) }} transition={{ duration: 1, ease: 'linear' }} />
                              </svg>
                              <span className="text-lg font-black text-white italic">{countdown}</span>
                           </div>
                        </div>
                     )}

                     <div className="p-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div className="flex-1 space-y-8">
                           <div className="flex items-center gap-4">
                              <div className={`p-5 rounded-3xl ${activeEmergency.status === 'pending' ? 'bg-red-600 animate-pulse' : 'bg-success'}`}>
                                 <ShieldAlert className="text-white" size={40} />
                              </div>
                              <div>
                                 <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{activeEmergency.status === 'pending' ? 'Priority SOS' : 'Handshake Confirmed'}</h3>
                                 <div className="flex gap-4 mt-3">
                                    {activeEmergency.transportType === 'ambulance' ? (
                                      <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-lg animate-pulse border border-red-600/20">
                                         <Ambulance size={14} className="text-red-500" />
                                         <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Ambulance Required</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-600/20">
                                         <Car size={14} className="text-blue-400" />
                                         <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Patient Self-Driving</span>
                                      </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-black/60 rounded-[40px] border border-white/5">
                              <div><p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1">Diagnosis</p><p className="text-sm font-bold text-red-500 uppercase">{activeEmergency.type || 'Trauma'}</p></div>
                              <div><p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1">Blood Type</p><p className="text-sm font-bold text-white uppercase">{activeEmergency.bloodType}</p></div>
                              <div className="col-span-2"><p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1">GPS Anchor</p><p className="text-sm font-bold text-blue-400 truncate">{activeEmergency.location}</p></div>
                           </div>

                           <div className="flex gap-4">
                              {isAccepted ? (
                                <>
                                  <button onClick={() => setShowDossier(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-2xl text-[11px] font-black uppercase shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02]"><FileText size={18} /> View Clinical Passport</button>
                                  {activeEmergency.transportType === 'ambulance' ? (
                                    <button onClick={handleTrackPatient} className="flex items-center gap-3 bg-white text-black px-8 py-5 rounded-2xl text-[11px] font-black uppercase shadow-2xl animate-pulse"><Navigation size={18} /> Dispatch: Track Patient</button>
                                  ) : (
                                    <div className="flex items-center gap-4 text-blue-400 bg-blue-600/5 px-8 py-5 rounded-2xl border border-blue-500/10">
                                       <Zap size={18} />
                                       <p className="text-[10px] font-black uppercase tracking-widest italic">Patient is en-route. Prepare ER entrance.</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-4 text-gray-700 bg-white/5 px-10 py-5 rounded-2xl border border-white/5">
                                   <Lock size={18} />
                                   <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Confidential clinical data is locked until Handshake is secured</p>
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="w-full lg:w-80 space-y-4">
                           {activeEmergency.status === 'pending' ? (
                             <>
                                <button onClick={() => acceptEmergency(currentHospital)} className="w-full bg-success text-white py-10 rounded-[50px] font-black uppercase tracking-widest shadow-2xl shadow-success/30 hover:scale-[1.02] transition-all">Accept Case</button>
                                <button onClick={rejectEmergency} className="w-full bg-red-600/10 text-red-500 py-4 rounded-[30px] border border-red-500/20 font-black uppercase tracking-widest text-[10px]">Divert Case</button>
                             </>
                           ) : (
                             <div className="bg-success/20 border border-success/40 p-14 rounded-[60px] text-center space-y-4">
                                <Check className="text-success mx-auto" size={64} />
                                <h4 className="text-success font-black uppercase tracking-widest text-sm italic tracking-[0.2em]">Node Secured</h4>
                             </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
                ) : (
                  <div className="glass-card p-32 border border-white/5 flex flex-col items-center justify-center text-center opacity-10">
                     <Activity className="text-gray-800 mb-6" size={64} />
                     <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em]">Listening for Targeted Trauma Signals...</p>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      ) : (
        /* APPOINTMENTS VIEW (SAME AS PREVIOUS) */
        <div className="space-y-6">
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] italic px-2">Daily Schedule Manager</h3>
           <div className="grid grid-cols-1 gap-4">
              {bookings.map((book) => (
                <div key={book.id} className="glass-card p-8 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="flex gap-6 items-center">
                      <div className="p-4 bg-blue-600/10 rounded-2xl"><Clock className="text-blue-500" size={24} /></div>
                      <div>
                        <h4 className="text-xl font-black text-white uppercase italic">{book.patientName}</h4>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{book.date} @ {book.time} | {book.reason}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      {book.status === 'pending' ? (
                        <>
                          <button onClick={() => updateBookingStatus(book.id, 'confirmed')} className="bg-success text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase">Accept</button>
                          <button onClick={() => updateBookingStatus(book.id, 'cancelled')} className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase">Reject</button>
                        </>
                      ) : (
                        <div className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border ${book.status === 'confirmed' ? 'bg-success/20 text-success border-success/30' : 'bg-red-600/20 text-red-500 border-red-600/30'}`}>{book.status}</div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* CLINCAL DOSSIER MODAL */}
      <AnimatePresence>
        {showDossier && activeEmergency && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/99 flex items-center justify-center p-6 backdrop-blur-3xl">
            <div className="glass-card p-12 w-full max-w-4xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20">
              <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-8">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Clinical Passport Dossier</h3>
                <button onClick={() => setShowDossier(false)}><X size={32} className="text-gray-600 hover:text-white" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="p-8 bg-white/[0.02] rounded-[30px] border border-white/5 space-y-4">
                       <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest border-b border-white/5 pb-3">Diagnostic Intelligence</h4>
                       <div className="flex flex-wrap gap-3">
                          {(activeEmergency.medicalHistory?.conditions || ["No Prior Records"]).map(c => <span key={c} className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-2 rounded-xl border border-blue-500/20 uppercase tracking-widest">{c}</span>)}
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest border-b border-white/5 pb-3">Surgical History</h4>
                    <p className="text-gray-300 text-sm italic leading-relaxed">{activeEmergency.medicalHistory?.surgeries || 'No clinical surgical records found in regional database.'}</p>
                 </div>
              </div>
              <button onClick={() => setShowDossier(false)} className="mt-12 w-full bg-white/10 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all">Close Secure Record Access</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isAuthView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/99 flex items-center justify-center p-6 backdrop-blur-3xl">
            <div className="glass-card p-12 w-full max-w-md border border-white/10 text-center">
              <ShieldAlert className="text-blue-500 mx-auto mb-10" size={64} />
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-10 italic">Infrastructure Node Access</h3>
              <form onSubmit={handleLogin} className="space-y-6">
                <input type="text" placeholder="Network Node ID" required value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-sm outline-none" />
                <input type="password" placeholder="Emergency Key" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-sm outline-none" />
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl uppercase tracking-widest shadow-2xl">Authorize Node</button>
                <button type="button" onClick={() => setIsAuthView(false)} className="w-full text-gray-700 text-[11px] font-black uppercase mt-10 tracking-[0.4em]">Abort Authorization</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const Car = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;

export default HospitalPanelView;
