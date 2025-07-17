import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Server, 
  Coins, 
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface AdminStats {
  totalUsers: number;
  totalBots: number;
  runningBots: number;
  totalCoins: number;
  bannedUsers: number;
  failedBots: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBots: 0,
    runningBots: 0,
    totalCoins: 0,
    bannedUsers: 0,
    failedBots: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      description: `${stats.bannedUsers} banned`,
    },
    {
      title: 'Total Bots',
      value: stats.totalBots,
      icon: Server,
      color: 'purple',
      description: `${stats.runningBots} running`,
    },
    {
      title: 'Total Coins',
      value: stats.totalCoins.toLocaleString(),
      icon: Coins,
      color: 'yellow',
      description: 'In circulation',
    },
    {
      title: 'System Health',
      value: `${Math.round((stats.runningBots / Math.max(stats.totalBots, 1)) * 100)}%`,
      icon: Activity,
      color: 'green',
      description: `${stats.failedBots} failed bots`,
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400';
      case 'purple':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400';
      case 'yellow':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400';
      case 'green':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">
          Overview of system statistics and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card 
            key={stat.title}
            className={`bg-gradient-to-br ${getColorClasses(stat.color)} backdrop-blur-lg`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.color === 'blue' ? 'text-blue-400' : 
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color === 'blue' ? 'text-blue-400' : 
                  stat.color === 'purple' ? 'text-purple-400' :
                  stat.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              System Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Database Status</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">API Status</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Deployment Service</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest system events and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">New user registered</p>
                <p className="text-xs text-slate-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Bot deployment completed</p>
                <p className="text-xs text-slate-400">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Coins transferred to user</p>
                <p className="text-xs text-slate-400">8 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;