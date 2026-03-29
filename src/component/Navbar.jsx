import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutGrid, User, ShieldCheck } from "lucide-react";

const Navbar = ({ isAdmin }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: <Home size={20}/>, label: "Home" },
    { path: "/library", icon: <BookOpen size={20}/>, label: "Vault" },
    { path: "/quiz", icon: <LayoutGrid size={20}/>, label: "Quiz" },
    { path: "/about", icon: <User size={20}/>, label: "About" },
  ];

  // Tambahkan menu Admin jika role valid
  if (isAdmin) {
    navItems.push({ path: "/admin", icon: <ShieldCheck size={20} className="text-yellow-500"/>, label: "Admin" });
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-900/50 rounded-2xl p-2 flex justify-around items-center shadow-2xl shadow-blue-900/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'text-blue-400 bg-blue-900/20 scale-110' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
