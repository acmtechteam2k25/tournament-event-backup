import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import ACMLogo from "./components/ACMLogo";
import Footer from "./components/Footer";
import Home from "./components/Home";
import BracketViewPage from "./pages/BracketViewPage";
import ReleasingSoon from "./components/ReleasingSoon";
import AdminPage from "./pages/AdminPage";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative w-screen overflow-x-hidden pt-14">
          {/* Navbar */}
          <Navbar />

          {/* ACM Logo */}
          <ACMLogo />

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bracket" element={<ReleasingSoon />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
