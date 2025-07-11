
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Coins, LogOut, Settings, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to={user ? '/dashboard' : '/'} 
            className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            <Zap className="w-8 h-8 text-blue-400" />
            <span>HACKLINK TECH.INC</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{user.coins}</span>
                </div>
                
                <span className="text-slate-300">Welcome, {user.username}</span>
                
                {user.email === 'admin@hacklink.com' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
