import { initializeApp } from "firebase/app";
import "firebase/firestore";
import { getFunctions, httpsCallable as H } from "firebase/functions";
import { GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import "firebase/functions";
export const fb = initializeApp({
  apiKey: "AIzaSyAIlzzxI0kZtIe4vvjSIiRwfqSQVZtbluM",
  authDomain: "bpimv2.firebaseapp.com",
  projectId: "bpimv2",
  storageBucket: "bpimv2.appspot.com",
  messagingSenderId: "199747072203",
  appId: "1:199747072203:web:79b7545a4e426763b5ab4e",
  measurementId: "G-4V5QE3YXF9",
});

export const auth = getAuth();
export const twitter = new TwitterAuthProvider();
export const google = new GoogleAuthProvider();
export default fb;

const f = getFunctions(fb, "asia-northeast1");

export const functions = f;

export const httpsCallable = (_cat: string, endpoint: string, data: any) => {
  return H(f, endpoint)(data);
};

export const httpsCfGet = async (endpoint: string, query?: string) => {
  const q = query ? "?" + query : "";
  return (
    await fetch(
      `https://asia-northeast1-bpimv2.cloudfunctions.net/${endpoint}${q}`
    )
  )
    .json()
    .then((t) => {
      return t;
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
};

import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://jxsyzykejxxbobyzrdai.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c3l6eWtlanh4Ym9ieXpyZGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM3NjQ0MTYsImV4cCI6MTk3OTM0MDQxNn0.hzFZsr2KLzC67Le2kUZ1KDHP-_Rsm0Pudovs4eY6-yk"
);
