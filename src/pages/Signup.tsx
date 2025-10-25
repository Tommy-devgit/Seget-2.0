import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Join Jeget 🎉</h1>
      <form onSubmit={handleSignup} className="w-80 bg-gray-900 p-6 rounded-2xl shadow-md">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-semibold">
          Sign Up
        </button>
      </form>
      <p
        onClick={() => navigate("/login")}
        className="mt-4 text-blue-400 hover:underline cursor-pointer"
      >
        Already have an account? Log in
      </p>
    </div>
  );
}
