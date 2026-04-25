import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ref, onValue, set, push, update, serverTimestamp } from 'firebase/database';
import { db } from '../firebase/config';
import { hospitalDatabase } from '../data/hospitalStore';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [currentHospital, setCurrentHospital] = useState(null);
  const [myRequestId, setMyRequestId] = useState(null);
  const [myRequestStatus, setMyRequestStatus] = useState('idle');
  const [transportType, setTransportType] = useState('self');
  const [acceptedHospitalCoords, setAcceptedHospitalCoords] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);

  // 1. HOSPITAL LISTENERS (SOS + Bookings)
  useEffect(() => {
    if (!currentHospital) return;
    
    // Emergency Listener
    const emergenciesRef = ref(db, 'emergencies/');
    const unsubscribeSOS = onValue(emergenciesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const myAlert = list.reverse().find(e => 
          e.targetHospitalId === currentHospital.id && 
          (e.status === 'pending' || e.status === 'accepted')
        );
        setActiveEmergency(myAlert || null);
      } else {
        setActiveEmergency(null);
      }
    });

    // Bookings Listener for Hospital
    const bookingsRef = ref(db, 'bookings/');
    const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const myBookings = list.filter(b => b.hospitalId === currentHospital.id);
        setBookings(myBookings.reverse());
      } else {
        setBookings([]);
      }
    });

    return () => {
      unsubscribeSOS();
      unsubscribeBookings();
    };
  }, [currentHospital?.id]);

  // 2. PATIENT/USER LISTENERS
  useEffect(() => {
    // Zero-Latency SOS Handshake
    if (myRequestId) {
      const myRef = ref(db, `emergencies/${myRequestId}`);
      const unsubscribeSOS = onValue(myRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMyRequestStatus(data.status);
          if (data.status === 'accepted') {
            setAcceptedHospitalCoords({
              lat: data.acceptedLat,
              lng: data.acceptedLng,
              name: data.acceptedByName
            });
          }
        }
      });
      return () => unsubscribeSOS();
    }

    // User Bookings Status
    const bookingsRef = ref(db, 'bookings/');
    const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setUserBookings(list.reverse());
      }
    });
    return () => unsubscribeBookings();
  }, [myRequestId]);

  const initiateDiscovery = () => {
    const userLat = 12.8706;
    const userLng = 74.8427;
    const sorted = [...hospitalDatabase].sort((a, b) => {
      const distA = Math.sqrt(Math.pow(userLat - a.lat, 2) + Math.pow(userLng - a.lng, 2));
      const distB = Math.sqrt(Math.pow(userLat - b.lat, 2) + Math.pow(userLng - b.lng, 2));
      return distA - distB;
    });
    setSortedHospitals(sorted);
    setCurrentAttemptIndex(0);
    return sorted;
  };

  const triggerSOS = async (index, hospitalsList = sortedHospitals, chosenTransport = transportType, triageData = {}) => {
    const hospital = hospitalsList[index];
    if (!hospital) { setMyRequestStatus('failed_all'); return; }
    const emergenciesRef = ref(db, 'emergencies/');
    const newId = push(emergenciesRef).key;
    const payload = {
      id: newId, status: 'pending', timestamp: Date.now(),
      targetHospitalId: hospital.id, targetHospitalName: hospital.name,
      location: 'AIET College, Mijar', userLat: 12.8706, userLng: 74.8427,
      transportType: chosenTransport,
      ...triageData, // Injects bloodType and emergencyType
      medicalHistory: JSON.parse(localStorage.getItem('userProfile') || '{}')
    };
    await set(ref(db, `emergencies/${newId}`), payload);
    setMyRequestId(newId);
    setMyRequestStatus('pending');
  };

  const acceptEmergency = async (hospital) => {
    if (!activeEmergency) return;
    const emergencyRef = ref(db, `emergencies/${activeEmergency.id}`);
    await update(emergencyRef, { 
      status: 'accepted', 
      acceptedBy: hospital.id,
      acceptedByName: hospital.name,
      acceptedLat: hospital.lat,
      acceptedLng: hospital.lng
    });
  };

  const createBooking = async (bookingData) => {
    const bookingsRef = ref(db, 'bookings/');
    const newBookingRef = push(bookingsRef);
    const payload = {
      id: newBookingRef.key,
      ...bookingData,
      status: 'pending',
      timestamp: Date.now()
    };
    await set(newBookingRef, payload);
  };

  const updateBookingStatus = async (bookingId, status, message = '') => {
    const bookingRef = ref(db, `bookings/${bookingId}`);
    await update(bookingRef, { status, hospitalMessage: message });
  };

  const expireCurrentRequest = async () => {
    if (!myRequestId) return;
    await update(ref(db, `emergencies/${myRequestId}`), { status: 'expired' });
  };

  return (
    <EmergencyContext.Provider value={{
      activeEmergency, currentHospital, setCurrentHospital,
      initiateDiscovery, triggerSOS, expireCurrentRequest,
      acceptEmergency,
      rejectEmergency: () => update(ref(db, `emergencies/${activeEmergency.id}`), { status: 'denied' }),
      myRequestStatus, transportType, setTransportType,
      sortedHospitals, currentAttemptIndex, setCurrentAttemptIndex,
      acceptedHospitalCoords, syncStatus: 'connected',
      bookings, userBookings, createBooking, updateBookingStatus
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
