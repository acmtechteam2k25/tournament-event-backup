import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCredentials = (username, password) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">

      {/* Login card with glassmorphism */}
    <div
  className="cal-sans-regular relative backdrop-blur-md border border-[#0d9c57]/40 rounded-2xl p-8 w-full max-w-md shadow-[0_0_30px_rgba(13,156,87,0.12)]"
  style={{
    background: "#06120E",
  }}
>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 text-shadow-glow">
            Admin Login
          </h2>
          <p className="text-white/60 text-sm">
            Access tournament administration panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-white/80 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="w-full bg-black/30 backdrop-blur-sm border border-[#0d9c57]/50 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#0d9c57]/60 focus:ring-2 focus:ring-[#0d9c57]/20 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full bg-black/30 backdrop-blur-sm border border-[#0d9c57]/50 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#0d9c57]/60 focus:ring-2 focus:ring-[#0d9c57]/20 transition-all duration-200"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
           className=" w-full group relative overflow-hidden text-base sm:text-lg px-6 sm:px-7 py-1.5
                        sm:py-4 rounded-full font-semibold border-[#0d9c57] bg-gradient-to-r
                        from-[#024028] to-[#0d9c57] transition-all duration-300 hover:scale-105
                         hover:shadow-[0_0_30px_rgba(13,156,87,.55)]">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Subtle glow effect */}
       <div
  className="absolute inset-0 rounded-2xl pointer-events-none"
  style={{
    border: "1px solid rgba(13,156,87,0.15)"
  }}
></div>
      </div>
    </div>
  );
};

export default Login;