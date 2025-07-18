import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Shield } from 'lucide-react';

const AdminToggle: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin (you can modify this logic based on your admin identification)
  const isAdmin = user?.email === 'admin@hacklink.com' || user?.username === 'admin';

  if (!isAdmin) {
    return null;
  }

  const handleAdminToggle = () => {
    navigate('/admin');
  };

  return (
    <Button
      onClick={handleAdminToggle}
      variant="outline"
      className="fixed bottom-4 right-4 bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-300 z-50"
    >
      <Shield className="w-4 h-4 mr-2" />
      Admin Panel
    </Button>
  );
};

export default AdminToggle;