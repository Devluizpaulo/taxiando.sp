import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKMxH78yJxByNbGTQUPKzRkPpcBYFIqNI",
  authDomain: "taxiandosp-519b1.firebaseapp.com",
  projectId: "taxiandosp-519b1",
  storageBucket: "taxiandosp-519b1.appspot.com",
  messagingSenderId: "9065042116",
  appId: "1:9065042116:web:903a4bf2f9eb00571d7991",
  measurementId: "G-3XS1FZ61V7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
