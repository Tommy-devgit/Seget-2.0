// src/pages/Forgot.tsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email, { url: "http://localhost:5173" });
      setMessage("Password reset email sent!");
    } catch (err: any) {
      setMessage(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold mb-6">Forgot Password?</h1>
      <form onSubmit={handleReset} className="w-80 bg-gray-900 p-6 rounded-2xl shadow-md">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none" />
        <button className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-semibold">Send Reset Link</button>
      </form>
      {message && <p className="mt-3 text-blue-400">{message}</p>}
    </div>
  );
}
