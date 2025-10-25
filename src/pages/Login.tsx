import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/");
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to Jeget 👋</h1>
      <form onSubmit={handleLogin} className="w-80 bg-gray-900 p-6 rounded-2xl shadow-md">
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
          Log In
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        className="mt-4 bg-white text-gray-900 font-semibold py-2 px-6 rounded-full"
      >
        Continue with Google
      </button>

      <p
        onClick={() => navigate("/signup")}
        className="mt-4 text-blue-400 hover:underline cursor-pointer"
      >
        Don’t have an account? Sign up
      </p>
      <p
        onClick={() => navigate("/forgot")}
        className="text-sm text-gray-400 hover:underline cursor-pointer mt-2"
      >
        Forgot password?
      </p>
    </div>
  );
}
