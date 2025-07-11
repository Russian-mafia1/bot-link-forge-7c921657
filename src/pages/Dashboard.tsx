
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Plus, 
  Gift, 
  Share, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Play,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface Bot {
  _id: string;
  name: string;
  githubRepo: string;
  status: 'running' | 'stopped' | 'deploying' | 'failed';
  createdAt: string;
  deploymentId?: string;
}

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isClaimingCoins, setIsClaimingCoins] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkClaimStatus();
    fetchBots();
  }, []);

  const checkClaimStatus = () => {
    if (!user?.lastClaim) {
      setCanClaim(true);
      return;
    }

    const lastClaim = new Date(user.lastClaim);
    const now = new Date();
    const timeDiff = now.getTime() - lastClaim.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    setCanClaim(hoursDiff >= 24);
  };

  const fetchBots = async () => {
    try {
      const response = await axios.get('/api/bots');
      setBots(response.data.bots);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimDailyCoins = async () => {
    setIsClaimingCoins(true);
    try {
      const response = await axios.post('/api/coins/claim-daily');
      updateUser({ coins: response.data.coins, lastClaim: new Date().toISOString() });
      setCanClaim(false);
      toast({
        title: "Coins claimed! 🎉",
        description: "You've received 10 coins. Come back tomorrow for more!",
      });
    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.response?.data?.message || "Failed to claim coins",
        variant: "destructive",
      });
    } finally {
      setIsClaimingCoins(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral link copied!",
      description: "Share it with friends to earn 10 coins per signup.",
    });
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
        return <Clock className="w-4 h-4 text-yellow-400" />;
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

  const restartBot = async (botId: string) => {
    try {
      await axios.post(`/api/bots/${botId}/restart`);
      toast({
        title: "Bot restarted",
        description: "Your bot is being restarted.",
      });
      fetchBots();
    } catch (error: any) {
      toast({
        title: "Restart failed",
        description: error.response?.data?.message || "Failed to restart bot",
        variant: "destructive",
      });
    }
  };

  const deleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    try {
      await axios.delete(`/api/bots/${botId}`);
      toast({
        title: "Bot deleted",
        description: "Your bot has been deleted successfully.",
      });
      fetchBots();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Failed to delete bot",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user.username}! 👋
        </h1>
        <p className="text-slate-400">
          Deploy and manage your WhatsApp bots with ease
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Coin Balance */}
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              Coin Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-4">{user.coins}</div>
            <Button
              onClick={claimDailyCoins}
              disabled={!canClaim || isClaimingCoins}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
            >
              {isClaimingCoins ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : canClaim ? (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim 10 Coins
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Claimed Today
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Referral */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 flex items-center">
              <Share className="w-5 h-5 mr-2" />
              Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono text-white mb-4 bg-slate-700/50 p-2 rounded">
              {user.referralCode}
            </div>
            <Button
              onClick={copyReferralLink}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Share className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </CardContent>
        </Card>

        {/* Deploy Bot */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Deploy New Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-400 mb-4">
              Cost: 10 coins per deployment
            </div>
            <Button
              onClick={() => navigate('/deploy')}
              disabled={user.coins < 10}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Deploy Bot
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deployed Bots */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Your Deployed Bots
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage and monitor your bot deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="ml-2 text-slate-400">Loading bots...</span>
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-4">No bots deployed yet</div>
              <Button
                onClick={() => navigate('/deploy')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Deploy Your First Bot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                        Created {new Date(bot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(bot.status)}>
                      {bot.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restartBot(bot._id)}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBot(bot._id)}
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
      </Card>
    </div>
  );
};

export default Dashboard;
