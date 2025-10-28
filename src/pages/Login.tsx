import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
      <form
        onSubmit={handleLogin}
        className="w-80 bg-gray-900 p-6 rounded-2xl shadow-md"
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button className="w-full bg-green-500 hover:bg-green-600 py-2 rounded font-semibold">
          Log In
        </button>
      </form>
      <p
        onClick={() => navigate("/signup")}
        className="mt-4 text-blue-400 hover:underline cursor-pointer"
      >
        Don’t have an account? Sign up
      </p>
    </div>
  );
}
