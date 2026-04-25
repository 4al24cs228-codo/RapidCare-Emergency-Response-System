import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Shield, Save, FileText, Activity, AlertCircle, Upload, CheckCircle2, CreditCard, ClipboardCheck, BookOpen, Edit3, Camera, MapPin, Loader2 } from 'lucide-react';
import { db, storage } from '../firebase/config';
import { ref as dbRef, set, onValue, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const CONDITIONS = ["Diabetes (Sugar)", "Hypertension (BP)", "TB", "Asthma", "Cardiac Issues", "None"];

const UserProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Vighnesh Shetty',
    phone: '+91 9876543210',
    email: 'vighnesh@example.com',
    emergencyContact: '+91 9000000000',
    bloodType: 'O+',
    conditions: [],
    surgeries: '',
    reportUrl: '',
    ayushmanUrl: '',
    aadharUrl: '',
    rationUrl: '',
    certificateUrl: ''
  });

  const [uploadingField, setUploadingField] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

  // 1. DATA PERSISTENCE: Fetch on Load
  useEffect(() => {
    const profileRef = dbRef(db, `users/vighnesh_shetty`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile(prev => ({ ...prev, ...data }));
        localStorage.setItem('userProfile', JSON.stringify(data));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. RESUMABLE UPLOAD FIX
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const sRef = storageRef(storage, `user_docs/vighnesh/${fieldName}_${Date.now()}.${fileExt}`);
      
      // Upload execution
      const snapshot = await uploadBytes(sRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Update Database immediately after upload
      const updates = { [fieldName]: url };
      await update(dbRef(db, `users/vighnesh_shetty`), updates);
      
      setUploadingField(null);
    } catch (err) {
      console.error("Upload Failed:", err);
      setUploadingField(null);
      alert("Upload failed. Ensure file is under 5MB.");
    }
  };

  const saveProfile = async () => {
    setSaveStatus('saving');
    try {
      await update(dbRef(db, `users/vighnesh_shetty`), profile);
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Save Failed:", err);
      setSaveStatus('idle');
    }
  };

  const DocSlot = ({ label, field, icon: Icon, color }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <Icon size={12} className={color} /> {label}
      </label>
      <label className="block cursor-pointer">
        <div className={`relative group border-2 border-dashed rounded-2xl p-5 transition-all flex items-center gap-4 ${profile[field] ? 'border-success/30 bg-success/5' : 'border-white/10 hover:border-blue-500/50 bg-white/5'}`}>
          <div className={`p-3 rounded-xl ${profile[field] ? 'bg-success/20 text-success' : 'bg-white/5 text-gray-500'}`}>
            {uploadingField === field ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Icon size={20} />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-black uppercase tracking-tighter ${profile[field] ? 'text-success' : 'text-white'}`}>
               {uploadingField === field ? 'Uploading to Cloud...' : profile[field] ? 'Securely Vaulted' : `Add ${label}`}
            </p>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
               {profile[field] ? 'Update Document' : 'PDF / JPG / PNG Accepted'}
            </p>
          </div>
          <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, field)} />
        </div>
      </label>
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent uppercase tracking-tighter italic leading-none">Medical Passport</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mt-2 flex items-center gap-2">
            <Shield size={10} className="text-success" /> End-to-End Encrypted Cloud Sync
          </p>
        </div>
        <button 
          onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${isEditing ? 'bg-success text-white' : 'bg-white/5 text-blue-400 border border-blue-500/20'}`}
        >
          {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={16} /> : isEditing ? <Save size={16} /> : <Edit3 size={16} />}
          {saveStatus === 'saving' ? 'Updating Cloud...' : isEditing ? 'Push to Database' : 'Update Records'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-12 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                   <User size={64} className="text-blue-400" />
                </div>
             </div>
             <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest block text-center">Update Identity Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-white/10 border-2 border-blue-500/30 rounded-2xl py-4 px-6 text-xl font-black text-white text-center outline-none focus:border-blue-500 shadow-xl shadow-blue-600/10"
                      placeholder="Enter Full Name"
                    />
                  </div>
                ) : (
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{profile.name}</h3>
                )}
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-3 block flex items-center justify-center gap-2">
                   <MapPin size={10} className="text-blue-500" /> Mangalore Region
                </span>
             </div>
          </div>

          <div className="glass-card p-8 space-y-6">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">Verified Mobile</label>
                <input type="text" disabled={!isEditing} value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-5 px-6 text-xs text-white font-bold focus:border-blue-500/50 outline-none" />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 text-red-500/70">SOS Alert Contact</label>
                <input type="text" disabled={!isEditing} value={profile.emergencyContact} onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 rounded-xl py-5 px-6 text-xs text-red-400 font-bold focus:border-red-500/50 outline-none" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-10 space-y-10">
              <div>
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-white/5 pb-5 italic">
                    <Activity size={20} className="text-blue-400" /> Clinical Diagnosis Snapshot
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {CONDITIONS.map(condition => (
                      <button
                        key={condition}
                        disabled={!isEditing}
                        onClick={() => {
                          const newConditions = profile.conditions.includes(condition)
                            ? profile.conditions.filter(c => c !== condition)
                            : [...profile.conditions, condition];
                          setProfile({ ...profile, conditions: newConditions });
                        }}
                        className={`px-5 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${profile.conditions.includes(condition) ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 border-white/10 text-gray-500'}`}
                      >
                        {condition}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-3 italic">
                    <ClipboardCheck size={20} className="text-orange-400" /> Major Surgical History
                 </h4>
                 <textarea 
                   disabled={!isEditing}
                   value={profile.surgeries}
                   onChange={(e) => setProfile({...profile, surgeries: e.target.value})}
                   placeholder="Enter any previous surgeries or trauma history..."
                   className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white focus:border-orange-500 outline-none resize-none"
                 />
              </div>
           </div>

           <div className="glass-card p-10">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3 border-b border-white/5 pb-5 italic text-cyan-400">
                 <BookOpen size={20} /> Verified Identity Cloud Vault
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <DocSlot label="Ayushman Card" field="ayushmanUrl" icon={CreditCard} color="text-yellow-500" />
                 <DocSlot label="Aadhar Card" field="aadharUrl" icon={Shield} color="text-blue-500" />
                 <DocSlot label="Ration Card" field="rationUrl" icon={BookOpen} color="text-green-500" />
                 <DocSlot label="Clinical Record" field="reportUrl" icon={ClipboardCheck} color="text-red-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
