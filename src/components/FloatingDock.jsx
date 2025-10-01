import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FloatingDock = ({ items }) => {
  return (
    <>
      <FloatingDockDesktop items={items} />
      <FloatingDockMobile items={items} />
    </>
  );
};

const FloatingDockMobile = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50 block md:hidden">
      {/* Mobile Menu Items */}
      <div className={`absolute right-0 top-full mt-2 flex flex-col gap-2 transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {items.map((item, idx) => (
          <div
            key={item.title}
            className="flex justify-center"
            style={{
              transitionDelay: open ? `${(items.length - 1 - idx) * 50}ms` : `${idx * 50}ms`
            }}
          >
            <Link
              to={item.href}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all duration-200"
              onClick={() => setOpen(false)}
            >
              <div className="h-6 w-6 text-white">{item.icon}</div>
            </Link>
          </div>
        ))}
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all duration-200"
      >
        <svg className={`h-6 w-6 text-white transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items }) => {
  const [mouseX, setMouseX] = useState(Infinity);
  const dockRef = useRef(null);

  const handleMouseMove = (e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX);
    }
  };

  const handleMouseLeave = () => {
    setMouseX(Infinity);
  };

  return (
    <div className="fixed top-4 right-4 z-50 hidden md:block">
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex h-20 items-center gap-3 rounded-2xl bg-black/20 backdrop-blur-md px-5 py-4 border border-white/10 shadow-lg"
      >
        {items.map((item, index) => (
          <IconContainer
            key={item.title}
            mouseX={mouseX}
            title={item.title}
            icon={item.icon}
            href={item.href}
            index={index}
            totalItems={items.length}
          />
        ))}
      </div>
    </div>
  );
};

const IconContainer = ({ mouseX, title, icon, href, index, totalItems }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (ref.current && mouseX !== Infinity) {
        const rect = ref.current.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(mouseX - itemCenter);
        
        // More aggressive scaling with smoother curve
        const maxDistance = 120;
        const maxScale = 2.2;
        const minScale = 1;
        
        if (distance < maxDistance) {
          // Use exponential easing for smoother effect
          const normalizedDistance = distance / maxDistance;
          const easeOut = 1 - Math.pow(normalizedDistance, 3);
          const scaleValue = minScale + (maxScale - minScale) * easeOut;
          setScale(scaleValue);
        } else {
          setScale(minScale);
        }
      } else {
        setScale(1);
      }
    };

    updateScale();
  }, [mouseX]);

  return (
    <Link to={href} className="relative">
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 cursor-pointer"
        style={{
          width: `${50 * scale}px`,
          height: `${50 * scale}px`,
          transition: 'all 0.1s cubic-bezier(0.23, 1, 0.320, 1)',
          transformOrigin: 'center center'
        }}
      >
        {/* Tooltip */}
        <div
          className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-sm text-white text-sm whitespace-nowrap border border-white/10 ${
            hovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'
          }`}
          style={{
            transition: 'all 0.15s cubic-bezier(0.23, 1, 0.320, 1)'
          }}
        >
          {title}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
        </div>

        {/* Icon */}
        <div
          className="flex items-center justify-center text-white"
          style={{
            width: `${24 * scale}px`,
            height: `${24 * scale}px`,
            transition: 'all 0.1s cubic-bezier(0.23, 1, 0.320, 1)'
          }}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
};

export default FloatingDock;