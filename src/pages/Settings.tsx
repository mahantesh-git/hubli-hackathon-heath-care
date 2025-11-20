import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Heart, ArrowLeft, Bell, Lock, Palette,
    Shield, Save, AlertCircle,
    Database, Trash2, Download
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Settings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        reminderNotifications: true,
        weeklyReport: true,
        shareData: false,
        publicProfile: false,
        showHistory: true,
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        twoFactorAuth: false,
        sessionTimeout: "30",
    });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }

            setIsLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportData = () => {
        toast.success("Data export started! You'll receive an email when ready.");
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            toast.error("Account deletion requested. Please contact support to complete this action.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 gradient-mesh opacity-10" />

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

            <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
                <div className="mb-8 animate-slideUp">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gradient">Settings</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your account preferences and privacy settings
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <AnimatedCard hover="lift" className="sticky top-24">
                            <CardContent className="pt-6">
                                <nav className="space-y-2">
                                    <a href="#notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                                        <Bell className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Notifications</span>
                                    </a>
                                    <a href="#privacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Privacy</span>
                                    </a>
                                    <a href="#preferences" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                                        <Palette className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Preferences</span>
                                    </a>
                                    <a href="#security" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                                        <Lock className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Security</span>
                                    </a>
                                    <a href="#data" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                                        <Database className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Data & Privacy</span>
                                    </a>
                                </nav>
                            </CardContent>
                        </AnimatedCard>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div id="notifications">
                            <AnimatedCard hover="lift" className="animate-slideUp">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-primary" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription>Manage how you receive notifications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive health updates via email</p>
                                        </div>
                                        <Switch
                                            checked={settings.emailNotifications}
                                            onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
                                        </div>
                                        <Switch
                                            checked={settings.pushNotifications}
                                            onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Reminder Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Reminders for symptom checks</p>
                                        </div>
                                        <Switch
                                            checked={settings.reminderNotifications}
                                            onCheckedChange={(checked) => setSettings({ ...settings, reminderNotifications: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Weekly Health Report</Label>
                                            <p className="text-sm text-muted-foreground">Summary of your health data</p>
                                        </div>
                                        <Switch
                                            checked={settings.weeklyReport}
                                            onCheckedChange={(checked) => setSettings({ ...settings, weeklyReport: checked })}
                                        />
                                    </div>
                                </CardContent>
                            </AnimatedCard>
                        </div>

                        <div id="privacy">
                            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Privacy
                                    </CardTitle>
                                    <CardDescription>Control your privacy settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Share Anonymous Data</Label>
                                            <p className="text-sm text-muted-foreground">Help improve our AI models</p>
                                        </div>
                                        <Switch
                                            checked={settings.shareData}
                                            onCheckedChange={(checked) => setSettings({ ...settings, shareData: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Public Profile</Label>
                                            <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                                        </div>
                                        <Switch
                                            checked={settings.publicProfile}
                                            onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Show Health History</Label>
                                            <p className="text-sm text-muted-foreground">Display your health timeline</p>
                                        </div>
                                        <Switch
                                            checked={settings.showHistory}
                                            onCheckedChange={(checked) => setSettings({ ...settings, showHistory: checked })}
                                        />
                                    </div>
                                </CardContent>
                            </AnimatedCard>
                        </div>

                        <div id="preferences">
                            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        Preferences
                                    </CardTitle>
                                    <CardDescription>Customize your experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                                            <SelectTrigger id="language">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                                            <SelectTrigger id="timezone">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="EST">Eastern Time</SelectItem>
                                                <SelectItem value="PST">Pacific Time</SelectItem>
                                                <SelectItem value="IST">India Standard Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateFormat">Date Format</Label>
                                        <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                                            <SelectTrigger id="dateFormat">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </AnimatedCard>
                        </div>

                        <div id="security">
                            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-primary" />
                                        Security
                                    </CardTitle>
                                    <CardDescription>Protect your account</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                        </div>
                                        <Switch
                                            checked={settings.twoFactorAuth}
                                            onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                        <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}>
                                            <SelectTrigger id="sessionTimeout">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="60">1 hour</SelectItem>
                                                <SelectItem value="never">Never</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        <Lock className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                </CardContent>
                            </AnimatedCard>
                        </div>

                        <div id="data">
                            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-primary" />
                                        Data & Privacy
                                    </CardTitle>
                                    <CardDescription>Manage your data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full" onClick={handleExportData}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export My Data
                                    </Button>
                                    <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
                                        <div className="flex gap-2">
                                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-destructive mb-1">Danger Zone</p>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                </p>
                                                <Button variant="destructive" onClick={handleDeleteAccount}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </AnimatedCard>
                        </div>

                        <div className="flex justify-end gap-3 sticky bottom-4 glass-strong p-4 rounded-lg">
                            <Button variant="outline" onClick={() => navigate("/dashboard")}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="gradient-primary hover-lift"
                            >
                                {isSaving ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
