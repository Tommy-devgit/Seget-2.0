// src/components/Header.tsx
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const displayName =
    profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "User";

  const avatar =
    profile?.avatar_url ||
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-800 text-white flex justify-between items-center px-4 py-3 z-50">
      <h1 className="text-xl font-bold text-blue-400 tracking-wide">Jeget</h1>

      {user && (
        <div className="flex items-center gap-3">
          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-700" />
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm font-semibold text-gray-200">{displayName}</span>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400">
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
