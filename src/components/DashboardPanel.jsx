// src/App.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // install lucide-react for icons

// Install icons if not yet installed:
// npm install lucide-react

// ✅ Sample Pages
const Home = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden max-w-sm w-full hover:shadow-2xl transition-shadow duration-300">
      <img
        src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d"
        alt="Profile"
        className="w-full h-56 object-cover"
      />
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">John Doe</h2>
        <p className="text-gray-600 mb-4">Full-Stack Developer</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg transition">
          View Profile
        </button>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4 text-center">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">About Page</h1>
    <p className="text-gray-700 max-w-md">
      This page describes our amazing responsive React and Tailwind CSS setup with a mobile navbar.
    </p>
  </div>
);

// ✅ Responsive Navbar Component
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">MyCardApp</h1>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 font-semibold border-b-2 border-blue-500"
                : "text-gray-700 hover:text-blue-500 transition"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 font-semibold border-b-2 border-blue-500"
                : "text-gray-700 hover:text-blue-500 transition"
            }
          >
            About
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-blue-500 transition"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 flex flex-col space-y-3">
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 font-semibold"
                : "text-gray-700 hover:text-blue-500 transition"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 font-semibold"
                : "text-gray-700 hover:text-blue-500 transition"
            }
          >
            About
          </NavLink>
        </div>
      )}
    </nav>
  );
};

// ✅ Main App
function App() {
  return (
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
  );
}

export default App;
