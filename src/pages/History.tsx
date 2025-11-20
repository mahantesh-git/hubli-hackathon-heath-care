import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Heart, Clock, AlertCircle, Activity, Plus, Search, Filter,
  Calendar, TrendingUp, BarChart3, Download, ArrowLeft, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { toast } from "sonner";

interface SymptomCheck {
  id: string;
  symptoms: any[];
  severity: string;
  duration_value: number;
  duration_unit: string;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<SymptomCheck[]>([]);
  const [filteredChecks, setFilteredChecks] = useState<SymptomCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: checksData } = await supabase
        .from("symptom_checks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (checksData) {
        setChecks(checksData as any);
        setFilteredChecks(checksData as any);
      }

      setIsLoading(false);
    };

    fetchHistory();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let filtered = [...checks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(check =>
        check.symptoms.some((s: any) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(check => check.severity === severityFilter);
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (timeFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(check =>
        new Date(check.created_at) >= filterDate
      );
    }

    setFilteredChecks(filtered);
  }, [searchQuery, severityFilter, timeFilter, checks]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive",
          text: "text-destructive",
          emoji: "😣"
        };
      case "moderate":
        return {
          bg: "bg-warning/10",
          border: "border-warning",
          text: "text-warning",
          emoji: "😐"
        };
      default:
        return {
          bg: "bg-success/10",
          border: "border-success",
          text: "text-success",
          emoji: "😊"
        };
    }
  };

  // Calculate statistics
  const stats = {
    total: checks.length,
    thisMonth: checks.filter(c => {
      const checkDate = new Date(c.created_at);
      const now = new Date();
      return checkDate.getMonth() === now.getMonth() &&
        checkDate.getFullYear() === now.getFullYear();
    }).length,
    severe: checks.filter(c => c.severity === "severe").length,
    moderate: checks.filter(c => c.severity === "moderate").length,
    mild: checks.filter(c => c.severity === "mild").length,
  };

  // Get symptom frequency
  const symptomFrequency: { [key: string]: number } = {};
  checks.forEach(check => {
    check.symptoms.forEach((s: any) => {
      symptomFrequency[s.name] = (symptomFrequency[s.name] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your health history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-10" />

      {/* Navigation */}
      <nav className="border-b border-border glass-strong sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-rainbow flex items-center justify-center animate-float">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">HealthCheck</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-4xl font-bold mb-2">
            Health <span className="text-gradient">History</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your health journey and symptom patterns over time
          </p>
        </div>

        {checks.length === 0 ? (
          <AnimatedCard hover="lift" className="animate-scaleIn">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No History Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your first symptom check to build your health timeline and track patterns
              </p>
              <Button onClick={() => navigate("/symptom-checker")} className="gradient-primary hover-lift">
                <Plus className="mr-2 h-4 w-4" />
                Start Symptom Check
              </Button>
            </CardContent>
          </AnimatedCard>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Checks</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">This Month</p>
                      <p className="text-3xl font-bold">{stats.thisMonth}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Severity Breakdown</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-destructive/10 text-destructive">{stats.severe}</Badge>
                        <Badge className="bg-warning/10 text-warning">{stats.moderate}</Badge>
                        <Badge className="bg-success/10 text-success">{stats.mild}</Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
                <CardContent className="pt-6">
                  <Button
                    onClick={() => navigate("/symptom-checker")}
                    className="w-full h-full gradient-primary hover-lift"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New Check
                  </Button>
                </CardContent>
              </AnimatedCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Filters */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.5s" }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      Filter & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search symptoms..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="3months">Last 3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredChecks.length} of {checks.length} checks
                      </p>
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* Timeline */}
                <div className="space-y-4">
                  {filteredChecks.map((check, index) => {
                    const symptoms = Array.isArray(check.symptoms) ? check.symptoms : [];
                    const severityInfo = getSeverityColor(check.severity);

                    return (
                      <AnimatedCard
                        key={check.id}
                        hover="lift"
                        onClick={() => navigate(`/results/${check.id}`)}
                        className="cursor-pointer animate-slideUp"
                        style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {/* Timeline dot */}
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full ${severityInfo.bg} flex items-center justify-center border-2 ${severityInfo.border}`}>
                                <span className="text-2xl">{severityInfo.emoji}</span>
                              </div>
                              {index < filteredChecks.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">
                                    Check #{checks.length - checks.indexOf(check)}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(check.created_at).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                      })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(check.created_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit', minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${severityInfo.bg} ${severityInfo.text} capitalize`}>
                                  {check.severity}
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Symptoms:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {symptoms.slice(0, 5).map((symptom: any, i: number) => (
                                      <Badge key={i} variant="secondary" className="hover-scale">
                                        {symptom.name}
                                      </Badge>
                                    ))}
                                    {symptoms.length > 5 && (
                                      <Badge variant="secondary">
                                        +{symptoms.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm">
                                  <span className="text-muted-foreground">Duration: </span>
                                  <span className="font-medium">
                                    {check.duration_value} {check.duration_unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Symptoms Chart */}
                {topSymptoms.length > 0 && (
                  <div className="animate-slideUp" style={{ animationDelay: "0.7s" }}>
                    <SimpleBarChart
                      data={topSymptoms}
                      title="Most Common Symptoms"
                      description="Your top 5 symptoms"
                    />
                  </div>
                )}

                {/* Insights Card */}
                <AnimatedCard
                  gradient="rainbow"
                  hover="glow"
                  className="animate-slideUp"
                  style={{ animationDelay: "0.8s" }}
                >
                  <div className="text-center p-6">
                    <Sparkles className="h-10 w-10 text-white mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg mb-2">Health Insights</h3>
                    <p className="text-white/90 text-sm mb-4">
                      Get personalized health trends and recommendations based on your history
                    </p>
                    <Button variant="secondary" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Insights
                    </Button>
                  </div>
                </AnimatedCard>

                {/* Quick Stats */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.9s" }}>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Severe Cases</span>
                      <Badge className="bg-destructive/10 text-destructive">{stats.severe}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Moderate Cases</span>
                      <Badge className="bg-warning/10 text-warning">{stats.moderate}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Mild Cases</span>
                      <Badge className="bg-success/10 text-success">{stats.mild}</Badge>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </div>
            </div>
          </>
        )}

        {/* Medical Disclaimer */}
        <div className="p-4 glass rounded-lg border-l-4 border-warning animate-slideUp" style={{ animationDelay: "1s" }}>
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning mb-1">Medical Disclaimer</p>
              <p className="text-muted-foreground">
                This tool provides general information only and is not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;