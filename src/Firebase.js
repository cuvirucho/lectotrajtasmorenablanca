// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkOUSjGX5VZkLc2z9nzmR1P01qrCJYLgE",
  authDomain: "morenamia-76bae.firebaseapp.com",
  projectId: "morenamia-76bae",
  storageBucket: "morenamia-76bae.firebasestorage.app",
  messagingSenderId: "703086520206",
  appId: "1:703086520206:web:62a7c1427a0207d6b966df",
  measurementId: "G-T78408PY5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);