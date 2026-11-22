import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} All rights reserved.
        </p>
        <p className="text-center sm:text-right">
          Designed & Developed by{' '}
          <a
            href="https://rootmile.com"
            target="_blank"
            rel="noopener"
            className="underline hover:text-slate-700 dark:hover:text-slate-200"
          >
            Rootmile Technologies
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
