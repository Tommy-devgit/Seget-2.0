import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { useAuth } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgot from "./pages/Forgot";

export default function App() {
  const { user } = useAuth();

  // Simple loading state: user is null initially, may want to show spinner
  if (user === undefined)
    return <div className="text-center mt-20 text-white">Loading...</div>;

  return (
    <Router>
      {user ? (
        <div className="min-h-screen bg-gray-950 text-white pb-16 pt-14">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />
        </Routes>
      )}
    </Router>
  );
}
