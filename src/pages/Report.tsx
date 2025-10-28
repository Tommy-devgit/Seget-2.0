// src/pages/Report.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [targetEmail, setTargetEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!user) return setStatus({ type: "error", message: "Please log in first." });
    if (!targetEmail.trim() || !description.trim())
      return setStatus({ type: "error", message: "All fields are required." });

    setLoading(true);

    try {
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("email", "==", targetEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus({ type: "error", message: "Target user not found." });
        setLoading(false);
        return;
      }

      const targetDoc = querySnapshot.docs[0];
      const targetId = targetDoc.id;

      await addDoc(collection(db, "bad_jokes"), {
        description,
        target_user: targetId,
        logged_by: user.uid,
        created_at: serverTimestamp(),
      });

      await updateDoc(doc(db, "profiles", targetId), {
        jokeCount: increment(1),
      });

      setStatus({ type: "success", message: "Report submitted successfully!" });
      setTargetEmail("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      <h1 className="text-2xl font-bold mb-6">Report a Bad Joke</h1>

      <form
        onSubmit={handleReport}
        className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800 shadow-md"
      >
        <input
          type="email"
          placeholder="Target user’s email"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          required
        />

        <textarea
          placeholder="Describe the bad joke..."
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {status.message && (
          <p
            className={`text-sm mb-3 ${
              status.type === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {status.message}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      <p
        onClick={() => navigate("/")}
        className="mt-4 text-blue-400 hover:underline cursor-pointer"
      >
        ← Back to Home
      </p>
    </div>
  );
}
