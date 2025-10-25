import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Edit2, Clock, Trophy } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", avatar_url: "" });

  // Fetch profile and activities
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData || null);

      const { data: jokesData } = await supabase
        .from("bad_jokes")
        .select("target_user");
      const counts: any = {};
      jokesData?.forEach((j) => {
        if (j.target_user) counts[j.target_user] = (counts[j.target_user] || 0) + 1;
      });
      const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      const r = sorted.indexOf(user.id) + 1;
      setRank(r > 0 ? r : null);

      const { data: userActivities } = await supabase
        .from("bad_jokes")
        .select("*, users:target_user(username)")
        .eq("logged_by", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setActivities(userActivities || []);

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (!user || loading) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  const totalJokes = activities.length;
  let level = "Joke Novice";
  if (totalJokes >= 20) level = "Top Jokester";
  else if (totalJokes >= 10) level = "Rising Joker";

  // Open edit modal
  const openEditModal = () => {
    setEditForm({
      username: profile?.username || "",
      avatar_url: profile?.avatar_url || "",
    });
    setEditOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await supabase
      .from("users")
      .update({
        username: editForm.username,
        avatar_url: editForm.avatar_url,
      })
      .eq("id", profile.id);

    setProfile({ ...profile, ...editForm });
    setEditOpen(false);
  };

  return (
    <div className="pt-20 px-4 pb-16 min-h-screen bg-gray-950 text-white">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-blue-500 mb-3"
        />
        <h1 className="text-2xl font-bold">{profile?.username || "Anonymous"}</h1>
        <p className="text-gray-400 text-sm">
          Joined {new Date(profile?.created_at).toLocaleDateString()}
        </p>
        <button
          onClick={openEditModal}
          className="mt-2 px-4 py-1 rounded-full border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center gap-1"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Stats Section */}
      <div className="flex justify-around mb-6">
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Trophy size={16} /> Rank
          </span>
          <span className="font-semibold text-lg">{rank || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm">Jokes Told</span>
          <span className="font-semibold text-lg">{totalJokes}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm">Level</span>
          <span className="font-semibold text-lg">{level}</span>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} /> Your Recent Bad Jokes
        </h2>
        {activities.length ? (
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <span className="text-gray-300">
                  Reported <b>{a.users?.[0]?.username || "Unknown"}</b> for “{a.description}”
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No jokes reported yet 😅</p>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 border border-gray-800 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 text-white p-2 rounded"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
              <input
                type="text"
                placeholder="Avatar URL"
                className="w-full bg-gray-800 text-white p-2 rounded"
                value={editForm.avatar_url}
                onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
              >
                Save
              </button>
            </form>
            <button
              onClick={() => setEditOpen(false)}
              className="w-full text-gray-400 hover:text-white mt-3 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
