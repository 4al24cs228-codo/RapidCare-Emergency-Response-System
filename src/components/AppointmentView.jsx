import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MessageSquare, Building2, CheckCircle2, ChevronRight, AlertCircle, CalendarCheck } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { hospitalDatabase } from '../data/hospitalStore';

const AppointmentView = () => {
  const { createBooking, userBookings, updateBookingStatus } = useEmergency();
  const [step, setStep] = useState('form'); // form, success
  const [formData, setFormData] = useState({
    hospitalId: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const hospital = hospitalDatabase.find(h => h.id === formData.hospitalId);
    createBooking({
      ...formData,
      hospitalName: hospital?.name,
      patientName: "Demo Patient", // In real app, get from Auth
      patientId: "USER_001"
    });
    setStep('success');
    setTimeout(() => {
      setStep('form');
      setFormData({ hospitalId: '', date: '', time: '', reason: '' });
    }, 3000);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 px-4">
      
      <div className="text-center space-y-2 pt-10">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Clinical Scheduler</h2>
        <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em]">Book Non-Emergency Consultations</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* BOOKING FORM */}
            <div className="glass-card p-10 border border-white/10 space-y-8">
               <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-4">New Request</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Select Facility</label>
                     <select 
                       required 
                       value={formData.hospitalId} 
                       onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-xs font-bold outline-none focus:border-blue-500/30"
                     >
                        <option value="" className="bg-black text-gray-400 italic">Select Hospital Node</option>
                        {hospitalDatabase.map(h => <option key={h.id} value={h.id} className="bg-black text-white">{h.name}</option>)}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Preferred Date</label>
                        <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-xs outline-none focus:border-blue-500/30" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Preferred Time</label>
                        <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-xs outline-none focus:border-blue-500/30" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Consultation Reason</label>
                     <textarea required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Describe symptoms or reason for visit..." className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-6 text-white text-xs outline-none focus:border-blue-500/30" />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all">Submit Booking</button>
               </form>
            </div>

            {/* MY RECENT BOOKINGS */}
            <div className="space-y-6">
               <h3 className="text-xl font-black text-white uppercase italic px-2">My Appointments</h3>
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {userBookings.length > 0 ? userBookings.map((book) => (
                    <div key={book.id} className="glass-card p-6 border border-white/5 bg-white/[0.02] space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-sm font-black text-white uppercase tracking-tighter">{book.hospitalName}</h4>
                             <p className="text-[9px] font-black text-gray-500 uppercase mt-1 italic">{book.date} @ {book.time}</p>
                          </div>
                          <div className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                             book.status === 'confirmed' ? 'bg-success/20 text-success border-success/30' : 
                             book.status === 'rescheduled' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                             book.status === 'cancelled' ? 'bg-red-600/20 text-red-500 border-red-600/30' :
                             'bg-white/10 text-gray-400 border-white/10'
                          }`}>
                             {book.status}
                          </div>
                       </div>

                       {book.status === 'rescheduled' && (
                         <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] font-bold text-orange-400 italic">Hospital Message: "{book.hospitalMessage}"</p>
                            <button 
                              onClick={() => updateBookingStatus(book.id, 'confirmed')}
                              className="w-full bg-orange-500 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
                            >
                               Accept Counter-Offer
                            </button>
                         </div>
                       )}
                    </div>
                  )) : (
                    <div className="glass-card p-12 text-center opacity-30 border-dashed border-2 border-white/5">
                       <CalendarCheck className="text-gray-800 mx-auto mb-4" size={40} />
                       <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No Active Bookings</p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-24 text-center border-2 border-success/30 max-w-lg mx-auto space-y-6 shadow-[0_0_80px_rgba(34,197,94,0.15)]">
             <CheckCircle2 className="text-success mx-auto" size={80} />
             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Request Routed</h3>
             <p className="text-gray-500 font-bold text-sm">Your consultation request is now in the hospital's queue. You will be notified of any counter-offers.</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AppointmentView;
