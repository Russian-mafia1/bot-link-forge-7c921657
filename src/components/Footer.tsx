
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-800/30 border-t border-slate-700/50 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-400">
          © {new Date().getFullYear()} HACKLINK TECH.INC - All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
