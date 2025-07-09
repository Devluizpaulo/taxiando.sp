import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCAzvyYFdJKjGKJ-eSP4gbfS6UwFGVc0O4",
  authDomain: "taxiandosp.firebaseapp.com",
  projectId: "taxiandosp",
  storageBucket: "taxiandosp.appspot.com",
  messagingSenderId: "614329407359",
  appId: "1:614329407359:web:0221716ee53e58fd47ec4a",
  measurementId: "G-PLH7F2J30E"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
