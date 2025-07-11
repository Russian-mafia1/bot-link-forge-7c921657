
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Server, 
  Coins, 
  Ban, 
  UserCheck, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
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

interface Bot {
  _id: string;
  name: string;
  githubRepo: string;
  status: 'running' | 'stopped' | 'deploying' | 'failed';
  userId: string;
  user?: { username: string; email: string };
  envVars?: Array<{ key: string; value: string }>;
  createdAt: string;
  deploymentId?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, botsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/bots')
      ]);
      setUsers(usersRes.data.users);
      setBots(botsRes.data.bots);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const adjustUserCoins = async (userId: string, amount: number) => {
    try {
      await axios.put(`/api/admin/users/${userId}/coins`, { amount });
      setUsers(users.map(u => u._id === userId ? { ...u, coins: u.coins + amount } : u));
      toast({
        title: "Coins updated",
        description: `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} coins.`,
      });
      setCoinAmount('');
      setSelectedUserId('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update coins",
        variant: "destructive",
      });
    }
  };

  const controlBot = async (botId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      if (action === 'delete') {
        await axios.delete(`/api/admin/bots/${botId}`);
        setBots(bots.filter(b => b._id !== botId));
        toast({
          title: "Bot deleted",
          description: "Bot has been deleted successfully.",
        });
      } else {
        await axios.post(`/api/admin/bots/${botId}/${action}`);
        // Update bot status optimistically
        setBots(bots.map(b => 
          b._id === botId 
            ? { ...b, status: action === 'stop' ? 'stopped' : 'running' }
            : b
        ));
        toast({
          title: `Bot ${action}ed`,
          description: `Bot has been ${action}ed successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${action} bot`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'deploying':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Pause className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'deploying':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (!user || user.email !== 'admin@hacklink.com') {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading admin panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <Shield className="w-8 h-8 mr-3 text-blue-400" />
          Admin Panel
        </h1>
        <p className="text-slate-400">
          Manage users, bots, and system settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Total Bots</p>
                <p className="text-2xl font-bold text-white">{bots.length}</p>
              </div>
              <Server className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Running Bots</p>
                <p className="text-2xl font-bold text-white">
                  {bots.filter(b => b.status === 'running').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Total Coins</p>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, user) => sum + user.coins, 0)}
                </p>
              </div>
              <Coins className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bots" className="data-[state=active]:bg-slate-600">
              <Server className="w-4 h-4 mr-2" />
              Bots
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-slate-400">
                Manage user accounts, coins, and permissions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Coin Management */}
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Coins className="w-4 h-4 mr-2 text-yellow-400" />
                  Coin Management
                </h3>
                <div className="flex space-x-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 text-white rounded px-3 py-2 flex-1"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.coins} coins)
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(e.target.value)}
                    className="w-32 bg-slate-700/50 border-slate-600/50 text-white"
                  />
                  <Button
                    onClick={() => adjustUserCoins(selectedUserId, parseInt(coinAmount))}
                    disabled={!selectedUserId || !coinAmount}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {users.map((userData) => (
                  <div
                    key={userData._id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${userData.isBanned ? 'bg-red-400' : 'bg-green-400'}`} />
                      <div>
                        <h3 className="font-semibold text-white">{userData.username}</h3>
                        <p className="text-sm text-slate-400">{userData.email}</p>
                        <p className="text-xs text-slate-500">
                          Joined {new Date(userData.createdAt).toLocaleDateString()}
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
            </CardContent>
          </TabsContent>

          {/* Bots Tab */}
          <TabsContent value="bots" className="space-y-6">
            <CardHeader>
              <CardTitle className="text-white">Bot Management</CardTitle>
              <CardDescription className="text-slate-400">
                Monitor and control all deployed bots
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {bots.length === 0 ? (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No bots deployed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bots.map((bot) => (
                    <div
                      key={bot._id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(bot.status)}
                        <div>
                          <h3 className="font-semibold text-white">{bot.name}</h3>
                          <p className="text-sm text-slate-400">{bot.githubRepo}</p>
                          <p className="text-xs text-slate-500">
                            Owner: {bot.user?.username || 'Unknown'} • 
                            Created {new Date(bot.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(bot.status)}>
                          {bot.status}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBot(bot)}
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlBot(bot._id, 'restart')}
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlBot(bot._id, 'delete')}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Bot Details Modal */}
      {selectedBot && (
        <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Bot Details: {selectedBot.name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBot(null)}
                className="border-slate-600/50 text-slate-400"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-300">GitHub Repository</Label>
                <p className="text-white bg-slate-700/50 p-2 rounded">{selectedBot.githubRepo}</p>
              </div>
              <div>
                <Label className="text-slate-300">Status</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(selectedBot.status)}
                  <span className="text-white">{selectedBot.status}</span>
                </div>
              </div>
            </div>

            {selectedBot.envVars && selectedBot.envVars.length > 0 && (
              <div>
                <Label className="text-slate-300">Environment Variables</Label>
                <div className="space-y-2 mt-2">
                  {selectedBot.envVars.map((env, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={env.key}
                        readOnly
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                      <Input
                        value={env.value}
                        readOnly
                        type="password"
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Admin;
