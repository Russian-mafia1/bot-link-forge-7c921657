
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Github, Zap, Settings, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface EnvVar {
  key: string;
  value: string;
}

const Deploy = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    githubRepo: '',
    buildCommand: 'npm install',
    startCommand: 'node index.js'
  });
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    if (envVars.length > 1) {
      setEnvVars(envVars.filter((_, i) => i !== index));
    }
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const updated = envVars.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    );
    setEnvVars(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.coins < 10) {
      toast({
        title: "Insufficient coins",
        description: "You need at least 10 coins to deploy a bot.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty env vars
    const validEnvVars = envVars.filter(env => env.key.trim() && env.value.trim());

    setIsLoading(true);
    try {
      const response = await axios.post('/api/bots/deploy', {
        ...formData,
        envVars: validEnvVars
      });

      updateUser({ coins: user.coins - 10 });
      
      toast({
        title: "Deployment started! 🚀",
        description: "Your bot is being deployed. This may take a few minutes.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Deployment failed",
        description: error.response?.data?.message || "Failed to deploy bot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Deploy New Bot</h1>
          <p className="text-slate-400">Deploy your WhatsApp bot from GitHub</p>
        </div>
      </div>

      {/* Cost Warning */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-semibold">Deployment Cost: 10 Coins</p>
              <p className="text-sm text-slate-400">
                Your balance: {user.coins} coins
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Form */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Github className="w-5 h-5 mr-2" />
            Bot Configuration
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure your bot deployment settings
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="my-whatsapp-bot"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubRepo" className="text-slate-300">GitHub Repository URL</Label>
                <Input
                  id="githubRepo"
                  name="githubRepo"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubRepo}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildCommand" className="text-slate-300">Build Command</Label>
                  <Input
                    id="buildCommand"
                    name="buildCommand"
                    value={formData.buildCommand}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startCommand" className="text-slate-300">Start Command</Label>
                  <Input
                    id="startCommand"
                    name="startCommand"
                    value={formData.startCommand}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600/50 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Environment Variables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Environment Variables
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">
                    Configure your bot's environment variables
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEnvVar}
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {envVars.map((env, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="KEY"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                    />
                    <Input
                      placeholder="VALUE"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEnvVar(index)}
                      disabled={envVars.length === 1}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || user.coins < 10}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying Bot...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy Bot (10 coins)
                </>
              )}
            </Button>

            {user.coins < 10 && (
              <p className="text-center text-red-400 text-sm">
                You need at least 10 coins to deploy a bot. 
                <Button
                  variant="link"
                  className="text-blue-400 p-0 ml-1"
                  onClick={() => navigate('/dashboard')}
                >
                  Claim daily coins
                </Button>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deploy;
