// src/components/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Settings } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <Trophy size={22} /> },
    { name: "Profile", path: "/profile", icon: <User size={22} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={22} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 py-2 flex justify-around items-center md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.4)]">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-1 text-xs transition-colors duration-200 ${
              active ? "text-blue-400" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
