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
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  username: string;
  coins: number;
}

interface CoinTransaction {
  _id: string;
  fromUser?: string;
  toUser: string;
  amount: number;
  type: 'transfer' | 'admin_grant' | 'admin_deduct';
  createdAt: string;
  userDetails?: {
    username: string;
    email: string;
  };
}

const AdminCoins = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
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
      const [usersRes, transactionsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/coins/transactions')
      ]);
      setUsers(usersRes.data.users);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load coin data",
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
    if (!transferEmail || !transferAmount) {
      toast({
        title: "Error",
        description: "Please enter both email and amount",
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
      await axios.post('/api/admin/coins/transfer', {
        email: transferEmail,
        amount: amount
      });

      // Refresh data
      await fetchData();
      
      setTransferEmail('');
      setTransferAmount('');
      
      toast({
        title: "Success",
        description: `Successfully transferred ${amount} coins to ${transferEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to transfer coins",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const adjustUserCoins = async (userId: string, amount: number) => {
    try {
      await axios.put(`/api/admin/users/${userId}/coins`, { amount });
      setUsers(users.map(u => u._id === userId ? { ...u, coins: u.coins + amount } : u));
      await fetchData(); // Refresh transactions
      toast({
        title: "Coins updated",
        description: `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} coins.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update coins",
        variant: "destructive",
      });
    }
  };

  const totalCoins = users.reduce((sum, user) => sum + user.coins, 0);
  const recentTransactions = transactions.slice(0, 10);

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
              <Label htmlFor="transfer-email" className="text-slate-300">User Email</Label>
              <Input
                id="transfer-email"
                type="email"
                placeholder="user@example.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
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
                disabled={isTransferring || !transferEmail || !transferAmount}
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
                  key={user._id}
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
                        onClick={() => adjustUserCoins(user._id, 100)}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 px-2"
                      >
                        +100
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustUserCoins(user._id, -100)}
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

        {/* Recent Transactions */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest coin transfers and adjustments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <ArrowUpDown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'admin_grant' ? 'bg-green-400' :
                        transaction.type === 'admin_deduct' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`} />
                      <div>
                        <p className="text-white text-sm">
                          {transaction.type === 'admin_grant' ? 'Admin Grant' :
                           transaction.type === 'admin_deduct' ? 'Admin Deduction' :
                           'Transfer'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {transaction.userDetails?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      transaction.amount > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCoins;