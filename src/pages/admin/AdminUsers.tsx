import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Ban, 
  UserCheck, 
  Search,
  Filter,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  username: string;
  coins: number;
  referralCode: string;
  isBanned: boolean;
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user =>
        filterStatus === 'banned' ? user.isBanned : !user.isBanned
      );
    }

    setFilteredUsers(filtered);
  };

  const banUser = async (userId: string, ban: boolean) => {
    try {
      await axios.put(`/api/admin/users/${userId}/ban`, { banned: ban });
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: ban } : u));
      toast({
        title: ban ? "User banned" : "User unbanned",
        description: `User has been ${ban ? 'banned' : 'unbanned'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {filteredUsers.length} users
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600/50 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-700/50 border border-slate-600/50 text-white rounded px-3 py-2"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="banned">Banned Users</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            All registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((userData) => (
                <div
                  key={userData._id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${userData.isBanned ? 'bg-red-400' : 'bg-green-400'}`} />
                    <div>
                      <h3 className="font-semibold text-white">{userData.username}</h3>
                      <p className="text-sm text-slate-400">{userData.email}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(userData.createdAt).toLocaleDateString()} • 
                        Referral: {userData.referralCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {userData.coins} coins
                    </Badge>
                    
                    {userData.isBanned ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Banned
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => banUser(userData._id, !userData.isBanned)}
                        className={userData.isBanned 
                          ? "border-green-500/50 text-green-400 hover:bg-green-500/10"
                          : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                        }
                      >
                        {userData.isBanned ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;