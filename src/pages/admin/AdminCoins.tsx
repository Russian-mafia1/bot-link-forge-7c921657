import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Send,
  Search,
  User,
  TrendingUp,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  coins: number;
}

const AdminCoins = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transferEmailOrUsername, setTransferEmailOrUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchData = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('id, email, username, coins')
        .order('coins', { ascending: false });

      if (error) throw error;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users.slice(0, 10)); // Show top 10 by default
    }
  };

  const transferCoins = async () => {
    if (!transferEmailOrUsername || !transferAmount) {
      toast({
        title: "Error",
        description: "Please enter both email/username and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(transferAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      const { data, error } = await supabase.functions.invoke('transfer-coins', {
        body: {
          emailOrUsername: transferEmailOrUsername,
          amount: amount
        }
      });

      if (error) throw error;

      // Refresh data
      await fetchData();
      
      setTransferEmailOrUsername('');
      setTransferAmount('');
      
      toast({
        title: "Success",
        description: `Successfully transferred ${amount} coins to ${transferEmailOrUsername}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer coins",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const adjustUserCoins = async (userId: string, amount: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newCoins = user.coins + amount;
      const { error } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, coins: newCoins } : u));
      toast({
        title: "Coins updated",
        description: `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} coins.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coins",
        variant: "destructive",
      });
    }
  };

  const totalCoins = users.reduce((sum, user) => sum + user.coins, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading coin data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Coin Management</h1>
          <p className="text-slate-400">
            Transfer coins and manage user balances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {totalCoins.toLocaleString()} total coins
          </Badge>
        </div>
      </div>

      {/* Transfer Coins */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Send className="w-5 h-5 mr-2 text-yellow-400" />
            Transfer Coins
          </CardTitle>
          <CardDescription className="text-slate-400">
            Send coins to users by email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-email" className="text-slate-300">Email or Username</Label>
              <Input
                id="transfer-email"
                placeholder="user@example.com or username"
                value={transferEmailOrUsername}
                onChange={(e) => setTransferEmailOrUsername(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-amount" className="text-slate-300">Amount</Label>
              <Input
                id="transfer-amount"
                type="number"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-transparent">Action</Label>
              <Button
                onClick={transferCoins}
                disabled={isTransferring || !transferEmailOrUsername || !transferAmount}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Balances */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              User Balances
            </CardTitle>
            <CardDescription className="text-slate-400">
              Search and manage individual user coin balances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {user.coins}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustUserCoins(user.id, 100)}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 px-2"
                      >
                        +100
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustUserCoins(user.id, -100)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 px-2"
                      >
                        -100
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Statistics
            </CardTitle>
            <CardDescription className="text-slate-400">
              Platform overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <span className="text-slate-300">Total Users</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {users.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <span className="text-slate-300">Total Coins in Circulation</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {totalCoins.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <span className="text-slate-300">Average Coins per User</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {users.length > 0 ? Math.round(totalCoins / users.length) : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCoins;