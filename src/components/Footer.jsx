import React from 'react';
import webLogo from '../assets/web.png';
import instaLogo from '../assets/insta.png';
import linkedinLogo from '../assets/linkedin.png';

const Footer = () => {
  return (
    <footer className="cal-sans-regular relative bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-6">
          
          {/* Left Side - ACM VNRVJIET */}
          <div className="cal-sans-regular text-center">
            <span className="text-white font-semibold text-lg block">Convergence 2K25R</span>
            <p className="text-white/60 text-sm">Student Chapter</p>
          </div>

          {/* Center - Contact & Rights */}
          <div className="cal-sans-regular text-center lg:flex-1">
            <div className="mb-3">
              <h4 className="text-white font-semibold mb-2 ">Contact</h4>
              <p className="text-white/80 text-sm">
                <a href="mailto: acmvnrvjiet@gmail.com" className="hover:text-blue-400 transition-colors">
                  acmvnrvjiet@gmail.com
                </a>
              </p>
            </div>
            <p className="text-white/60 text-xs">
              © 2025 ACM VNRVJIET. All rights reserved.
            </p>
          </div>

          {/* Right Side - Social Handles */}
          <div className="flex items-center space-x-4">
            <span className="text-white/80 text-sm mr-2 hidden sm:block">Follow us:</span>
            
            {/* Website */}
            <a 
              href="https://vnrvjiet.acm.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
              title="Official Website"
            >
              <img 
                src={webLogo} 
                alt="Website" 
                className="w-8 h-8 object-contain opacity-80 hover:opacity-100 group-hover:scale-110 transition-all duration-200"
              />
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com/acm_vnrvjiet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
              title="Instagram"
            >
              <img 
                src={instaLogo} 
                alt="Instagram" 
                className="w-8 h-8 object-contain opacity-80 hover:opacity-100 group-hover:scale-110 transition-all duration-200"
              />
            </a>

            {/* LinkedIn */}
            <a 
              href="https://linkedin.com/company/acm-vnrvjiet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
              title="LinkedIn"
            >
              <img 
                src={linkedinLogo} 
                alt="LinkedIn" 
                className="w-8 h-8 object-contain opacity-80 hover:opacity-100 group-hover:scale-110 transition-all duration-200"
              />
            </a>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="border-t border-white/10 pt-4 pb-2">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
