// src/pages/Leaderboard.tsx
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { db } from "../lib/firebaseConfig";
import { collection, onSnapshot, getDoc, doc } from "firebase/firestore";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<{ username: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bad_jokes"), async (snap) => {
      const counts: Record<string, number> = {};
      // count per target_user
      snap.docs.forEach(d => {
        const data = d.data() as any;
        if (data.target_user) counts[data.target_user] = (counts[data.target_user] || 0) + 1;
      });

      const entries = await Promise.all(
        Object.keys(counts).map(async (uid) => {
          let username = uid;
          try {
            const p = await getDoc(doc(db, "profiles", uid));
            if (p.exists()) username = p.data().fullName || username;
          } catch {}
          return { username, count: counts[uid] };
        })
      );

      entries.sort((a,b)=>b.count - a.count);
      setLeaderboard(entries);
      setLoading(false);
    }, (err) => { console.error("leaderboard snapshot err", err); setLoading(false); });

    return () => unsub();
  }, []);

  return (
    <div className="pt-20 px-4 pb-16 min-h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy size={24} className="text-yellow-400" /> Leaderboard</h1>
      {loading ? <p className="text-gray-400">Loading...</p> : leaderboard.length ? (
        <div className="space-y-3">
          {leaderboard.map((u, i) => (
            <div key={i} className={`flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900 ${i===0 ? "border-yellow-400" : ""}`}>
              <span className="font-semibold text-gray-200">{i+1}️⃣ {u.username}</span>
              <span className="text-gray-400">{u.count} reports</span>
            </div>
          ))}
        </div>
      ) : <p className="text-gray-500">No reports yet 😅</p>}
    </div>
  );
}
