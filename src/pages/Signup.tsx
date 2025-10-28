// src/pages/Signup.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: fullName });
      // create profile doc
      await setDoc(doc(db, "profiles", userCred.user.uid), {
        fullName,
        email,
        avatar_url: "",
        createdAt: new Date().toISOString(),
      });

      // redirect to home (signed in)
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Join Jeget 🎉</h1>
      <form onSubmit={handleSignup} className="w-80 bg-gray-900 p-6 rounded-2xl shadow-md space-y-3">
        <input value={fullName} onChange={(e)=>setFullName(e.target.value)} required type="text" placeholder="Full Name" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} required type="password" placeholder="Password" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required type="password" placeholder="Confirm Password" className="w-full p-2 rounded bg-gray-800 text-white" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-semibold">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
