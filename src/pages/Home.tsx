import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ target_user: "", description: "", datetime: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Fetch users for dropdown
  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("id, username");
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err.message);
    }
  };

  fetchUsers();
}, []);



  // Fetch recent activity
  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("bad_jokes")
        .select("*, users:target_user(username)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setActivities(data);
    };
    fetchActivities();
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("bad_jokes")
        .select("target_user, users:target_user(username)");

      if (!data) return;

      // Count reports per user
      const counts: Record<string, { username: string; count: number }> = {};
      data.forEach((j) => {
        if (j.target_user) {
          const username =
            Array.isArray(j.users) ? j.users[0]?.username : (j.users as any)?.username || "";
          if (!counts[j.target_user]) counts[j.target_user] = { username, count: 0 };
          counts[j.target_user].count += 1;
        }
      });

      const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
      setLeaderboard(sorted.slice(0, 5)); // top 5
    };
    fetchLeaderboard();
  }, [activities]); // refresh when activities change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.target_user || !form.description || !form.datetime) return;

    setSubmitting(true);

    const { error } = await supabase.from("bad_jokes").insert([
      {
        logged_by: user.id, // auto-fill current user
        target_user: form.target_user,
        description: form.description,
        created_at: form.datetime,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      setModalOpen(false);
      setForm({ target_user: "", description: "", datetime: "" });

      // refresh activities & leaderboard
      const { data: newActivities } = await supabase
        .from("bad_jokes")
        .select("*, users:target_user(username)")
        .order("created_at", { ascending: false })
        .limit(5);
      setActivities(newActivities || []);
    } else {
      console.error(error);
    }
  };

  return (
    <div className="pt-20 px-4 pb-24">
      {/* Add Bad Joke Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-full font-semibold text-white shadow-lg transition"
        >
          <Plus size={20} /> Add Bad Joke
        </button>
      </div>

      {/* Recent Activity */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} /> Recent Activity
        </h2>
        {activities.length ? (
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <span className="text-gray-300">
                  <b>{a.users?.username}</b> got reported for “{a.description}”
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No bad jokes yet 😅</p>
        )}
      </section>

      {/* Leaderboard Highlight */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy size={18} /> Leaderboard Highlight
        </h2>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Top Jokers 🥇</p>
          <ul className="space-y-2">
            {leaderboard.length
              ? leaderboard.map((u, i) => (
                  <li key={i}>
                    {i + 1}️⃣ {u.username} - {u.count} reports
                  </li>
                ))
              : "No reports yet"}
          </ul>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-2xl w-80 border border-gray-800 shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-xl font-semibold mb-4">Report a Bad Joke 😬</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Dropdown users */}
                <select
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  value={form.target_user}
                  onChange={(e) => setForm({ ...form, target_user: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>

                {/* Date/Time picker */}
                <input
                  type="datetime-local"
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  value={form.datetime}
                  onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                />

                {/* Description */}
                <textarea
                  placeholder="Describe the bad joke..."
                  className="w-full bg-gray-800 text-white p-2 rounded h-24 resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>

                <button
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </form>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full text-gray-400 hover:text-white mt-3 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
