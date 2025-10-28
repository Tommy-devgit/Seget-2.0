// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../lib/firebaseConfig";
import { doc, setDoc, collection, query, where, orderBy, limit, onSnapshot, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Edit2, Clock, Trophy } from "lucide-react";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", avatar_url: "" });
  
  const displayName =
    profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "User";

  const avatar =
    profile?.avatar_url ||
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;


  // sync local profile state to context profile
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  // subscribe to activities created by this user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "bad_jokes"), where("logged_by", "==", user.uid), orderBy("created_at", "desc"), limit(20));
    const unsub = onSnapshot(q, async (snap) => {
      const docs = await Promise.all(snap.docs.map(async d => {
        const data = d.data() as any;
        let targetName = data.target_user || "Unknown";
        if (data.target_user) {
          try {
            const p = await getDoc(doc(db, "profiles", data.target_user));
            if (p.exists()) targetName = p.data().fullName || targetName;
          } catch {}
        }
        return { id: d.id, ...data, target_user_name: targetName };
      }));
      setActivities(docs);
      setLoading(false);
    }, (err) => { console.error("activity snapshot err", err); setLoading(false); });

    return () => unsub();
  }, [user]);

  // ranking: subscribe to all bad_jokes and compute counts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bad_jokes"), (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const data = d.data() as any;
        if (data.target_user) counts[data.target_user] = (counts[data.target_user] || 0) + 1;
      });
      const sorted = Object.keys(counts).sort((a,b) => (counts[b]||0) - (counts[a]||0));
      const r = user ? sorted.indexOf(user.uid) + 1 : -1;
      setRank(r > 0 ? r : null);
    });

    return () => unsub();
  }, [user]);

  if (!user || loading) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  const totalJokes = activities.length;
  let level = "Joke Novice";
  if (totalJokes >= 20) level = "Top Jokester";
  else if (totalJokes >= 10) level = "Rising Joker";

  const openEditModal = () => {
    setEditForm({
      fullName: localProfile?.fullName || user.displayName || "",
      avatar_url: localProfile?.avatar_url || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // update profiles collection
      await setDoc(doc(db, "profiles", user.uid), {
        ...(localProfile || {}),
        fullName: editForm.fullName,
        avatar_url: editForm.avatar_url,
        email: user.email || "",
        createdAt: localProfile?.createdAt || new Date().toISOString(),
      });

      // also update firebase auth profile (so Header displayName/photoURL reflect)
      await updateProfile(auth.currentUser!, {
        displayName: editForm.fullName,
        photoURL: editForm.avatar_url || auth.currentUser?.photoURL || null,
      });

      // refresh profile in context (context has snapshot listener so it should update automatically; call refresh for safety)
      await refreshProfile();

      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <div className="pt-20 px-4 pb-16 min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <img src={ avatar || `https://i.pravatar.cc/150?u=${user.uid}`} alt="Profile" className="w-24 h-24 rounded-full border-2 border-blue-500 mb-3" />
        <h1 className="text-2xl font-bold">{localProfile?.fullName || user.displayName || "Anonymous"}</h1>
        <p className="text-gray-400 text-sm">Joined {localProfile?.createdAt ? new Date(localProfile.createdAt).toLocaleDateString() : "Unknown"}</p>
        <button onClick={openEditModal} className="mt-2 px-4 py-1 rounded-full border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center gap-1">
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-around mb-6">
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm flex items-center gap-1"><Trophy size={16}/> Rank</span>
          <span className="font-semibold text-lg">{rank || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm">Jokes Reported</span>
          <span className="font-semibold text-lg">{totalJokes}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-800 w-1/3">
          <span className="text-gray-400 text-sm">Level</span>
          <span className="font-semibold text-lg">{level}</span>
        </div>
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock size={18} /> Your Recent Bad Jokes</h2>
        {activities.length ? (
          <div className="space-y-3">
            {activities.map(a => (
              <div key={a.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                <span className="text-gray-300">Reported <b>{a.target_user_name || "Unknown"}</b> for “{a.description || "No description"}”</span>
                <span className="text-xs text-gray-500">{a.created_at ? new Date(a.created_at).toLocaleString() : "Unknown"}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No jokes reported yet 😅</p>}
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 border border-gray-800 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input value={editForm.fullName} onChange={(e)=>setEditForm({...editForm,fullName:e.target.value})} type="text" placeholder="Full Name" className="w-full bg-gray-800 text-white p-2 rounded" />
              <input value={editForm.avatar_url} onChange={(e)=>setEditForm({...editForm,avatar_url:e.target.value})} type="text" placeholder="Avatar URL" className="w-full bg-gray-800 text-white p-2 rounded" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">Save</button>
            </form>
            <button onClick={()=>setEditOpen(false)} className="w-full text-gray-400 hover:text-white mt-3 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
