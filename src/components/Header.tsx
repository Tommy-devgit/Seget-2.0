import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-800 text-white flex justify-between items-center px-4 py-3 z-50">
      {/* Left: Logo */}
      <h1 className="text-xl font-bold text-blue-400 tracking-wide">Jeget</h1>

      {/* Right: User Info */}
      {user && (
        <div className="flex items-center gap-3">
          <img
            src={
              user.user_metadata?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.email || "User"
              )}&background=0D8ABC&color=fff`
            }
            alt="avatar"
            className="w-8 h-8 rounded-full border border-gray-700"
          />
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm font-semibold text-gray-200">
              {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
