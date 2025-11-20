import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart, Activity, Clock, AlertCircle, LogOut, Plus,
  TrendingUp, Calendar, Bell, Settings, Sparkles,
  Zap, Target, Award, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { HealthMetricCard } from "@/components/HealthMetricCard";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Profile {
  full_name: string | null;
}

interface SymptomCheck {
  id: string;
  symptoms: any;
  severity: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentChecks, setRecentChecks] = useState<SymptomCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch recent checks
      const { data: checksData } = await supabase
        .from("symptom_checks")
        .select("id, symptoms, severity, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (checksData) {
        setRecentChecks(checksData);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Mock data for health metrics
  const healthMetrics = {
    totalChecks: recentChecks.length,
    wellnessScore: 85,
    lastCheckDays: recentChecks.length > 0 ?
      Math.floor((Date.now() - new Date(recentChecks[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    activeSymptoms: recentChecks.filter(c => c.severity === "severe" || c.severity === "moderate").length,
  };

  const symptomTrends = [
    { label: "Headache", value: 12 },
    { label: "Fatigue", value: 8 },
    { label: "Cough", value: 6 },
    { label: "Fever", value: 4 },
    { label: "Nausea", value: 3 },
  ];

  const healthTips = [
    { icon: "💧", title: "Stay Hydrated", description: "Drink at least 8 glasses of water daily" },
    { icon: "🏃", title: "Daily Exercise", description: "30 minutes of activity keeps you healthy" },
    { icon: "🥗", title: "Balanced Diet", description: "Include fruits and vegetables in every meal" },
    { icon: "😴", title: "Quality Sleep", description: "Aim for 7-9 hours of sleep each night" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-rainbow flex items-center justify-center animate-float">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">HealthCheck</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover-scale">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button variant="ghost" onClick={() => navigate("/history")}>
              History
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your health overview for today
          </p>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
            <HealthMetricCard
              title="Total Checks"
              value={healthMetrics.totalChecks}
              icon={<Activity className="h-4 w-4" />}
              color="primary"
              change={12}
              trend="up"
            />
          </div>

          <div className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <HealthMetricCard
              title="Wellness Score"
              value={`${healthMetrics.wellnessScore}%`}
              icon={<Heart className="h-4 w-4" />}
              color="success"
              change={5}
              trend="up"
            />
          </div>

          <div className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <HealthMetricCard
              title="Last Check"
              value={`${healthMetrics.lastCheckDays}d ago`}
              icon={<Clock className="h-4 w-4" />}
              color="accent"
            />
          </div>

          <div className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <HealthMetricCard
              title="Active Symptoms"
              value={healthMetrics.activeSymptoms}
              icon={<AlertCircle className="h-4 w-4" />}
              color={healthMetrics.activeSymptoms > 0 ? "warning" : "success"}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="animate-slideUp" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Start your health journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <AnimatedCard
                    hover="lift"
                    onClick={() => navigate("/symptom-checker")}
                    className="cursor-pointer"
                  >
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full gradient-primary flex items-center justify-center">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">New Check</h3>
                      <p className="text-xs text-muted-foreground">Start symptom analysis</p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard
                    hover="lift"
                    onClick={() => navigate("/history")}
                    className="cursor-pointer"
                  >
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full gradient-secondary flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">View History</h3>
                      <p className="text-xs text-muted-foreground">Track your progress</p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard
                    hover="lift"
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer"
                  >
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full gradient-accent flex items-center justify-center">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">Settings</h3>
                      <p className="text-xs text-muted-foreground">Manage preferences</p>
                    </div>
                  </AnimatedCard>
                </div>
              </CardContent>
            </Card>

            {/* Symptom Trends */}
            <div className="animate-slideUp" style={{ animationDelay: "0.6s" }}>
              <SimpleBarChart
                data={symptomTrends}
                title="Common Symptoms (Last 30 Days)"
                description="Track your most frequent symptoms"
              />
            </div>

            {/* Recent Checks */}
            <Card className="animate-slideUp" style={{ animationDelay: "0.7s" }}>
              <CardHeader>
                <CardTitle>Recent Symptom Checks</CardTitle>
                <CardDescription>Your most recent health assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {recentChecks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No symptom checks yet</p>
                    <Button onClick={() => navigate("/symptom-checker")} className="gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Your First Check
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentChecks.map((check) => {
                      const symptoms = Array.isArray(check.symptoms) ? check.symptoms : [];
                      const severityColors = {
                        severe: "border-l-destructive bg-destructive/5",
                        moderate: "border-l-warning bg-warning/5",
                        mild: "border-l-success bg-success/5",
                      };

                      return (
                        <div
                          key={check.id}
                          className={`p-4 border-l-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover-lift ${severityColors[check.severity as keyof typeof severityColors]
                            }`}
                          onClick={() => navigate(`/results/${check.id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium mb-1">
                                {symptoms.slice(0, 3).map((s: any) => s.name).join(", ")}
                                {symptoms.length > 3 && ` +${symptoms.length - 3} more`}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {check.severity} severity
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(check.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wellness Score */}
            <Card className="animate-slideUp" style={{ animationDelay: "0.8s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Wellness Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthMetrics.wellnessScore / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gradient">{healthMetrics.wellnessScore}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Great job! Keep maintaining your health routine.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    View Insights
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card className="animate-slideUp" style={{ animationDelay: "0.9s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Daily Health Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthTips.map((tip, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <AnimatedCard
              gradient="rainbow"
              hover="glow"
              className="animate-slideUp"
              style={{ animationDelay: "1s" }}
            >
              <div className="text-center p-4">
                <Sparkles className="h-8 w-8 text-white mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Upgrade to Premium</h3>
                <p className="text-white/90 text-sm mb-4">
                  Get advanced health insights and personalized recommendations
                </p>
                <Button variant="secondary" className="w-full">
                  Learn More
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 p-4 glass rounded-lg border-l-4 border-warning animate-slideUp" style={{ animationDelay: "1.1s" }}>
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning mb-1">Medical Disclaimer</p>
              <p className="text-muted-foreground">
                This tool provides general information only and is not a substitute for professional medical advice. Always consult with your healthcare provider for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;