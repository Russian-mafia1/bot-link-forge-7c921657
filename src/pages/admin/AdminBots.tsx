import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Server, 
  Search,
  Filter,
  Eye,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

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

const AdminBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [filteredBots, setFilteredBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'stopped' | 'deploying' | 'failed'>('all');
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  useEffect(() => {
    filterBots();
  }, [bots, searchTerm, filterStatus]);

  const fetchBots = async () => {
    try {
      const response = await axios.get('/api/admin/bots');
      setBots(response.data.bots);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      toast({
        title: "Error",
        description: "Failed to load bots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterBots = () => {
    let filtered = bots;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bot =>
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.githubRepo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bot => bot.status === filterStatus);
    }

    setFilteredBots(filtered);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading bots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bot Management</h1>
          <p className="text-slate-400">
            Monitor and control all deployed bots
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {filteredBots.length} bots
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
                  placeholder="Search bots by name, repo, or owner..."
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
                <option value="all">All Bots</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="deploying">Deploying</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bots List */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Server className="w-5 h-5 mr-2 text-purple-400" />
            Bots ({filteredBots.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            All deployed bots in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBots.length === 0 ? (
            <div className="text-center py-8">
              <Server className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No bots found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBots.map((bot) => (
                <div
                  key={bot._id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/40 transition-colors"
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
      </Card>

      {/* Bot Details Dialog */}
      <Dialog open={!!selectedBot} onOpenChange={() => setSelectedBot(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2 text-purple-400" />
              {selectedBot?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Repository</p>
                  <p className="text-white">{selectedBot.githubRepo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge className={getStatusColor(selectedBot.status)}>
                    {selectedBot.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Owner</p>
                  <p className="text-white">{selectedBot.user?.username || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created</p>
                  <p className="text-white">{new Date(selectedBot.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedBot.deploymentId && (
                <div>
                  <p className="text-sm text-slate-400">Deployment ID</p>
                  <p className="text-white font-mono text-sm bg-slate-700/50 p-2 rounded">
                    {selectedBot.deploymentId}
                  </p>
                </div>
              )}

              {selectedBot.envVars && selectedBot.envVars.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Environment Variables</p>
                  <div className="space-y-2">
                    {selectedBot.envVars.map((envVar, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                        <span className="text-white font-mono text-sm">{envVar.key}</span>
                        <span className="text-slate-400 font-mono text-sm">***</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBots;