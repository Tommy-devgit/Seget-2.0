import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<
    { username: string; count: number }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bad_jokes")
          .select("target_user, users:target_user(username)");

        if (error) throw error;
        if (!data) return;

        const counts: Record<string, { username: string; count: number }> = {};

        data.forEach((joke) => {
          if (joke.target_user) {
            const username =
              Array.isArray(joke.users)
                ? joke.users[0]?.username
                : (joke.users as any)?.username || "Unknown";
            if (!counts[joke.target_user])
              counts[joke.target_user] = { username, count: 0 };
            counts[joke.target_user].count += 1;
          }
        });

        const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
        setLeaderboard(sorted);
      } catch (err: any) {
        console.error("Failed to fetch leaderboard:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="pt-20 px-4 pb-16 min-h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy size={24} className="text-yellow-400" /> Leaderboard
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : leaderboard.length ? (
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900 ${
                index === 0
                  ? "border-yellow-400 bg-yellow-950"
                  : index === 1
                  ? "border-gray-400"
                  : ""
              }`}
            >
              <span className="font-semibold text-gray-200">
                {index + 1}️⃣ {user.username}
              </span>
              <span className="text-gray-400">{user.count} reports</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reports yet 😅</p>
      )}
    </div>
  );
}
