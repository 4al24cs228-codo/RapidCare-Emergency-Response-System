import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0hypZKO1M8ZlJvna-DpTIdLub8rhJXok",
  authDomain: "rapidcare-71e41.firebaseapp.com",
  projectId: "rapidcare-71e41",
  storageBucket: "rapidcare-71e41.firebasestorage.app",
  messagingSenderId: "21142129275",
  appId: "1:21142129275:web:3c6715f4c7160b14fe70de",
  measurementId: "G-9S37SGS6ZH",
  databaseURL: "https://rapidcare-71e41-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getDatabase(app);
export const storage = getStorage(app);