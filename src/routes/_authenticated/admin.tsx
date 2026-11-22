import React from 'react';

export const AdminRoute: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex flex-col justify-between">
        <div>
          {/* Admin Navigation */}
        </div>
        <div className="p-4 border-t">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Need help or changes?{' '}
            <a
              href="https://wa.me/919673454452?text=Hi%20Rootmile%2C%20I%20need%20help%20with%20the%20Kahani%20Studio%20website"
              target="_blank"
              rel="noopener"
              className="underline hover:text-slate-700 dark:hover:text-slate-200"
            >
              Rootmile Technologies
            </a>
          </div>
          <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            Sign out
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminRoute;
