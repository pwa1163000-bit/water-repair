import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ใส่ของหยก",
  authDomain: "ใส่ของหยก",
  projectId: "ใส่ของหยก",
  storageBucket: "ใส่ของหยก",
  messagingSenderId: "ใส่ของหยก",
  appId: "ใส่ของหยก"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
