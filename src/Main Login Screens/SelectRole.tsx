import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";
import logo from "../assets/logo.png";

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeekerSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      // Configure Google Sign-In to work better with popups
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document with seeker role
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: "seeker",
          images: [], // Empty array for images
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Navigate to seeker dashboard or home
      navigate("/seeker/dashboard");
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center space-y-2 text-center w-full max-w-lg">
        {/* Logo */}
        <div className="relative w-40 md:w-64 flex items-center justify-center mb-2">
          <img
            src={logo}
            alt="FixItNow Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="font-rostex text-3xl md:text-4xl  uppercase tracking-wide leading-[1.1]">
          <span className="text-[#FF5A00]">ARE YOU A</span>
          <br />
          <span className="text-[#0072D1]">SERVICE PROVIDER OR</span>
          <br />
          <span className="text-[#0072D1]">SEEKER</span>
        </h1>

        {/* Spacer */}
        <div className="h-8" />

        {/* Buttons */}
        <div className="flex flex-col w-full max-w-sm gap-3">
          <button
            onClick={() => navigate("/haveaccount")}
            className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold text-xl py-4 rounded-full
              transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-lg"
          >
            <span className="relative z-10">Service Provider</span>
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>

          <button
            onClick={handleSeekerSignIn}
            disabled={loading}
            className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold text-xl py-4 rounded-full
              transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Service Seeker"
              )}
            </span>
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
