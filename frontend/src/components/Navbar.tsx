import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Kanban, LogOut, User as UserIcon, Sun, Moon, Users } from 'lucide-react';

interface NavbarProps {
  onOpenUserModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUserModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-3 flex items-center justify-between text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold shadow-md shadow-indigo-500/20">
          <Kanban className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold text-lg tracking-tight">IssueFlow</span>
      </div>

      <div className="flex items-center space-x-3">
        {isAdmin && onOpenUserModal && (
          <button
            onClick={onOpenUserModal}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            title="Manage Team Members"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="flex items-center space-x-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <UserIcon className="h-3.5 w-3.5 text-indigo-500" />
          <span>{user?.fullName}</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] uppercase font-bold">
            {user?.role?.replace('ROLE_', '')}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-rose-500 transition-colors py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};