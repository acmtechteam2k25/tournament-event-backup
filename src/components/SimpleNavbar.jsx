import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SimpleNavbar = () => {
  const location = useLocation();

  // Define navigation items
  const navItems = [
    {
      title: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/'
    },
    // {
    //   title: 'Tournament',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    //     </svg>
    //   ),
    //   href: '/bracket'
    // },
    {
      title: 'Admin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/admin'
    }
  ];

  // Check if current path matches item href
  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="fixed top-4 left-20 z-50 hidden md:block">
        <div className="flex h-20 items-center gap-2 rounded-2xl bg-black/20 backdrop-blur-md px-4 py-4 border border-white/10 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="relative group"
            >
              <div
                className={`relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={{
                  width: '56px',
                  height: '56px'
                }}
              >
                {/* Tooltip */}
                <div
                  className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-sm text-white text-sm whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-150`}
                >
                  {item.title}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center" style={{ width: '24px', height: '24px' }}>
                  {item.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="fixed top-4 left-4 z-50 block md:hidden">
        <div className="flex h-16 items-center gap-2 rounded-2xl bg-black/20 backdrop-blur-md px-3 py-3 border border-white/10 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="relative group"
            >
              <div
                className={`flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={{
                  width: '44px',
                  height: '44px'
                }}
              >
                {/* Tooltip */}
                <div
                  className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 backdrop-blur-sm text-white text-xs whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-150`}
                >
                  {item.title}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-black/90"></div>
                </div>

                <div className="flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
                  {item.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default SimpleNavbar;