
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Github, 
  Coins, 
  Shield, 
  Rocket, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Code,
  Server,
  Globe
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub Integration",
      description: "Deploy directly from your GitHub repositories with seamless integration."
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Coin Economy",
      description: "Earn daily coins and use them to deploy your bots. Refer friends for bonus coins!"
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Auto Deployment",
      description: "Automated deployment with custom build and start commands via Render API."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with reliable uptime for your bot deployments."
    }
  ];

  const stats = [
    { label: "Bots Deployed", value: "10,000+", icon: <Rocket className="w-5 h-5" /> },
    { label: "Active Users", value: "2,500+", icon: <Users className="w-5 h-5" /> },
    { label: "Uptime", value: "99.9%", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Countries", value: "50+", icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="space-y-6">
          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30">
            🚀 Deploy WhatsApp Bots Instantly
          </Badge>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Deploy Your Bots
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for deploying WhatsApp bots from GitHub. 
            Simple, fast, and powerful - just like you need it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-lg text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-2 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Deploy
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed to make bot deployment simple and efficient
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-lg hover:bg-slate-800/50 transition-all duration-300">
              <CardHeader>
                <div className="text-blue-400 mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Deploy in 3 Simple Steps
          </h2>
          <p className="text-xl text-slate-400">
            Get your WhatsApp bot live in minutes, not hours
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">1. Connect GitHub</h3>
            <p className="text-slate-400">
              Link your GitHub repository containing your WhatsApp bot code
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">2. Configure</h3>
            <p className="text-slate-400">
              Set your build commands, environment variables, and deployment settings
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">3. Deploy</h3>
            <p className="text-slate-400">
              Hit deploy and watch your bot go live instantly with automatic scaling
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-lg max-w-4xl mx-auto">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Deploy Your First Bot?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust HACKLINK TECH.INC for their bot deployments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8"
              >
                Start Building Now
                <Zap className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 text-lg px-8"
              >
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
