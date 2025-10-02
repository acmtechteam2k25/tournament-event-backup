import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import BracketViewPage from "./pages/BracketViewPage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative w-screen overflow-x-hidden" style={{ backgroundColor: '#000000ff' }}>
          {/* Navbar */}
          <Navbar />
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bracket" element={<BracketViewPage />} />
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
