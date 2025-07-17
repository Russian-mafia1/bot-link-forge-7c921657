import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database,
  Server,
  Key,
  Globe,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface SystemSettings {
  renderServiceId: string;
  apiEndpoint: string;
  maxBotsPerUser: number;
  defaultUserCoins: number;
  systemStatus: 'active' | 'maintenance';
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    renderServiceId: '',
    apiEndpoint: '',
    maxBotsPerUser: 5,
    defaultUserCoins: 10,
    systemStatus: 'active'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await axios.put('/api/admin/settings', settings);
      setUnsavedChanges(false);
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const testConnection = async () => {
    try {
      await axios.post('/api/admin/test-connection');
      toast({
        title: "Connection successful",
        description: "All system connections are working properly.",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.response?.data?.message || "System connection test failed",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-slate-400">
            Configure system-wide settings and integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unsavedChanges && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={saveSettings}
            disabled={isSaving || !unsavedChanges}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Settings */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Server className="w-5 h-5 mr-2 text-purple-400" />
              Deployment Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure deployment service settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="render-service-id" className="text-slate-300">
                Render Service ID
              </Label>
              <Input
                id="render-service-id"
                type="text"
                placeholder="srv-xxxxxxxxxxxxxxxxxxxx"
                value={settings.renderServiceId}
                onChange={(e) => updateSetting('renderServiceId', e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white font-mono"
              />
              <p className="text-xs text-slate-500">
                Your Render service ID for bot deployments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-endpoint" className="text-slate-300">
                API Endpoint
              </Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="https://api.render.com"
                value={settings.apiEndpoint}
                onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <p className="text-xs text-slate-500">
                Deployment service API endpoint
              </p>
            </div>

            <Button
              onClick={testConnection}
              variant="outline"
              className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Globe className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-400" />
              User Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Default settings for new users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-bots" className="text-slate-300">
                Max Bots Per User
              </Label>
              <Input
                id="max-bots"
                type="number"
                min="1"
                max="20"
                value={settings.maxBotsPerUser}
                onChange={(e) => updateSetting('maxBotsPerUser', parseInt(e.target.value))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <p className="text-xs text-slate-500">
                Maximum number of bots each user can deploy
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-coins" className="text-slate-300">
                Default User Coins
              </Label>
              <Input
                id="default-coins"
                type="number"
                min="0"
                value={settings.defaultUserCoins}
                onChange={(e) => updateSetting('defaultUserCoins', parseInt(e.target.value))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <p className="text-xs text-slate-500">
                Starting coin balance for new users
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-status" className="text-slate-300">
                System Status
              </Label>
              <select
                id="system-status"
                value={settings.systemStatus}
                onChange={(e) => updateSetting('systemStatus', e.target.value as 'active' | 'maintenance')}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance Mode</option>
              </select>
              <p className="text-xs text-slate-500">
                Current system operational status
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              System Information
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current system status and health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Database Status</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
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
                {settings.renderServiceId ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Configured</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400">Not Configured</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-700/30 rounded-lg border border-orange-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Admin Account</span>
              </div>
              <p className="text-xs text-slate-400">
                Admin has unlimited coins for system management
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Key className="w-5 h-5 mr-2 text-yellow-400" />
              Security & Access
            </CardTitle>
            <CardDescription className="text-slate-400">
              Security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Security Notice</span>
              </div>
              <p className="text-sm text-slate-300">
                Only users with admin@hacklink.com email address can access this admin panel.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Two-Factor Authentication</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Not Available
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">API Rate Limiting</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Request Logging</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;