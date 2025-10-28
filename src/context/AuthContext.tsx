// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  type DocumentData,
} from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  profile: DocumentData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);

      if (u) {
        // listen to profile doc changes in real-time
        const profileRef = doc(db, "profiles", u.uid);
        const unsubProfile = onSnapshot(
          profileRef,
          async (snap) => {
            if (snap.exists()) setProfile(snap.data());
            else {
              // create profile automatically if missing
              const defaultProfile = {
                fullName: u.displayName || u.email?.split("@")[0] || "Anonymous",
                email: u.email || "",
                avatar_url: "",
                createdAt: new Date().toISOString(),
              };
              // try create
              try {
                await setDoc(profileRef, defaultProfile);
                setProfile(defaultProfile);
              } catch (e) {
                console.error("Failed to auto-create profile:", e);
              }
            }
            setLoading(false);
          },
          (err) => {
            console.error("profile snapshot error:", err);
            setLoading(false);
          }
        );

        // cleanup profile listener when user changes
        return () => unsubProfile();
      } else {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileRef = doc(db, "profiles", user.uid);
    const snap = await getDoc(profileRef);
    if (snap.exists()) setProfile(snap.data());
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
