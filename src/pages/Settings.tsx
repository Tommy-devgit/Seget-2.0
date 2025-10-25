import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Trash2, Info } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    await supabase.from("users").delete().eq("id", user.id);
    await supabase.auth.signOut(); // remove from Supabase auth
    logout();
  };

  return (
    <div className="pt-20 px-4 pb-16 min-h-screen bg-gray-950 text-white space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* Account */}
      <section className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 font-semibold"
        >
          <LogOut size={18} /> Log Out
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 font-semibold text-red-400"
        >
          <Trash2 size={18} /> Delete Account
        </button>
      </section>

      {/* App Preferences */}
      <section className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-lg font-semibold">Preferences</h2>

        <div className="flex justify-between items-center">
          <span>Notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            className="toggle"
          />
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-lg font-semibold">About</h2>
        <p>Jeget v1.0.0</p>
        <p className="text-gray-400 text-sm flex items-center gap-1">
          <Info size={16} /> Made for dorm fun!
        </p>
      </section>
    </div>
  );
}
