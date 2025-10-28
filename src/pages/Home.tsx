// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Home() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; fullName: string }[]>([]);
  const [form, setForm] = useState({ target_user: "", description: "", datetime: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ username: string; count: number }[]>([]);

  // fetch profiles list (simple)
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const snap = await getDocs(collection(db, "profiles"));
        setUsers(snap.docs.map((d) => ({ id: d.id, fullName: d.data().fullName || "Unknown" })));
      } catch (e) {
        console.error("fetch profiles err", e);
      }
    };
    fetchProfiles();
  }, []);

  // subscribe to latest activities (real-time)
  useEffect(() => {
    const q = query(collection(db, "bad_jokes"), orderBy("created_at", "desc"), limit(20));
    const unsub = onSnapshot(q, async (snap) => {
      // map through and attach cached target names if possible
      const acts = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as any;
          let targetName = data.target_user;
          if (data.target_user) {
            try {
              const p = await getDoc(doc(db, "profiles", data.target_user));
              if (p.exists()) targetName = p.data().fullName || targetName;
            } catch {}
          }
          return {
            id: d.id,
            logged_by: data.logged_by,
            target_user: data.target_user,
            target_user_name: targetName || "Unknown",
            description: data.description || "",
            created_at: data.created_at || "",
          };
        })
      );
      setActivities(acts);
    });

    return () => unsub();
  }, []);

  // leaderboard: recalc whenever activities change
  useEffect(() => {
    const counts: Record<string, { username: string; count: number }> = {};
    activities.forEach((a) => {
      if (!a.target_user) return;
      const username = a.target_user_name || a.target_user;
      if (!counts[a.target_user]) counts[a.target_user] = { username, count: 0 };
      counts[a.target_user].count += 1;
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    setLeaderboard(sorted.slice(0, 10));
  }, [activities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in");
    if (!form.target_user || !form.description || !form.datetime) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "bad_jokes"), {
        logged_by: user.uid,
        target_user: form.target_user,
        description: form.description,
        created_at: form.datetime,
      });

      const targetRef = doc(db, "profiles", form.target_user);
      const targetSnap = await getDoc(targetRef);
      if (targetSnap.exists()) {
        const prevCount = targetSnap.data().jokeCount || 0;
        await updateDoc(targetRef, { jokeCount: prevCount + 1 });
      }

      // Reset form
      setForm({ target_user: "", description: "", datetime: "" });
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to submit", err);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="pt-20 px-4 pb-24">
      <div className="flex justify-center mb-6">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-full text-white">
          <Plus size={20} /> Add Bad Joke
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock size={18} /> Recent Activity</h2>
        {activities.length ? (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                <span className="text-gray-300"><b>{a.target_user_name}</b> got reported for “{a.description}”</span>
                <span className="text-xs text-gray-500">{a.created_at ? new Date(a.created_at).toLocaleString() : "Unknown"}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No bad jokes yet 😅</p>}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Trophy size={18} /> Leaderboard Highlight</h2>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Top Jokers 🥇</p>
          <ul className="space-y-2">
            {leaderboard.length ? leaderboard.map((u, i) => <li key={i}>{i+1}️⃣ {u.username} - {u.count} reports</li>) : "No reports yet"}
          </ul>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-900 p-6 rounded-2xl w-80 border border-gray-800 shadow-lg" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h3 className="text-xl font-semibold mb-4">Report a Bad Joke 😬</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <select value={form.target_user} onChange={(e)=>setForm({...form,target_user:e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
                <input type="datetime-local" value={form.datetime} onChange={(e)=>setForm({...form,datetime:e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded" />
                <textarea placeholder="Describe the bad joke..." value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded h-24 resize-none"></textarea>
                <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">{submitting ? "Submitting..." : "Submit"}</button>
              </form>
              <button onClick={()=>setModalOpen(false)} className="w-full text-gray-400 hover:text-white mt-3 text-sm">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
