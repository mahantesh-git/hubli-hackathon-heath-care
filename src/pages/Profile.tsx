import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Heart, ArrowLeft, User, Mail, Calendar, MapPin, Phone,
    Edit2, Save, X, Camera, Award, Activity, TrendingUp,
    CheckCircle2, Clock, Target, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Profile data
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        location: "",
        bio: "",
        emergencyContact: "",
        bloodType: "",
        allergies: "",
        medications: "",
    });

    // Temporary edit state
    const [editedProfile, setEditedProfile] = useState({ ...profile });

    // Health stats (mock data - in production, fetch from database)
    const healthStats = {
        totalChecks: 24,
        wellnessScore: 85,
        streak: 7,
        lastCheck: "2 days ago",
        avgSeverity: "Mild",
        mostCommon: "Headache",
    };

    const achievements = [
        { icon: "🏆", title: "Health Champion", description: "7 day streak!" },
        { icon: "⭐", title: "Early Adopter", description: "Joined in 2024" },
        { icon: "💪", title: "Wellness Warrior", description: "85% score" },
    ];

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            setUser(session.user);

            // Fetch profile from database
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (profileData) {
                const data = profileData as any; // Type assertion to handle extended fields
                const loadedProfile = {
                    fullName: data.full_name || "",
                    email: session.user.email || "",
                    phone: data.phone || "",
                    dateOfBirth: data.date_of_birth || "",
                    gender: data.gender || "",
                    location: data.location || "",
                    bio: data.bio || "",
                    emergencyContact: data.emergency_contact || "",
                    bloodType: data.blood_type || "",
                    allergies: data.allergies || "",
                    medications: data.medications || "",
                };
                setProfile(loadedProfile);
                setEditedProfile(loadedProfile);
            }

            setIsLoading(false);
        };

        loadProfile();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editedProfile.fullName,
                    phone: editedProfile.phone,
                    date_of_birth: editedProfile.dateOfBirth,
                    gender: editedProfile.gender,
                    location: editedProfile.location,
                    bio: editedProfile.bio,
                    emergency_contact: editedProfile.emergencyContact,
                    blood_type: editedProfile.bloodType,
                    allergies: editedProfile.allergies,
                    medications: editedProfile.medications,
                })
                .eq("id", user.id);

            if (error) throw error;

            setProfile(editedProfile);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading profile..." />
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
            <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
                {/* Header with Profile Picture */}
                <div className="mb-8 animate-slideUp">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full gradient-rainbow flex items-center justify-center text-4xl font-bold text-white">
                                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover-scale">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    {profile.fullName || "User Profile"}
                                </h1>
                                <p className="text-muted-foreground text-lg flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {profile.email}
                                </p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <Button onClick={handleEdit} className="gradient-primary hover-lift">
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleCancel}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving} className="gradient-primary hover-lift">
                                    {isSaving ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <AnimatedCard hover="lift" className="animate-slideUp">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Your basic profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={isEditing ? editedProfile.fullName : profile.fullName}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={profile.email}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={isEditing ? editedProfile.phone : profile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Input
                                            id="gender"
                                            value={isEditing ? editedProfile.gender : profile.gender}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Male/Female/Other"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={isEditing ? editedProfile.location : profile.location}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={isEditing ? editedProfile.bio : profile.bio}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </AnimatedCard>

                        {/* Medical Information */}
                        <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Medical Information
                                </CardTitle>
                                <CardDescription>Important health details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bloodType">Blood Type</Label>
                                        <Input
                                            id="bloodType"
                                            value={isEditing ? editedProfile.bloodType : profile.bloodType}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, bloodType: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="A+, B-, O+, etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                                        <Input
                                            id="emergencyContact"
                                            value={isEditing ? editedProfile.emergencyContact : profile.emergencyContact}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        value={isEditing ? editedProfile.allergies : profile.allergies}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, allergies: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="List any allergies..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medications">Current Medications</Label>
                                    <Textarea
                                        id="medications"
                                        value={isEditing ? editedProfile.medications : profile.medications}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, medications: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="List current medications..."
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </AnimatedCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Health Stats */}
                        <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Health Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Checks</span>
                                    <Badge className="gradient-primary text-white">{healthStats.totalChecks}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Wellness Score</span>
                                    <Badge className="gradient-secondary text-white">{healthStats.wellnessScore}%</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Current Streak</span>
                                    <Badge className="gradient-accent text-white">{healthStats.streak} days</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Last Check</span>
                                    <span className="text-sm font-medium">{healthStats.lastCheck}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Avg Severity</span>
                                    <Badge variant="outline" className="border-success text-success">{healthStats.avgSeverity}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Most Common</span>
                                    <span className="text-sm font-medium">{healthStats.mostCommon}</span>
                                </div>
                            </CardContent>
                        </AnimatedCard>

                        {/* Achievements */}
                        <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg hover:bg-primary/5 transition-colors">
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <div>
                                            <h4 className="font-semibold text-sm">{achievement.title}</h4>
                                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </AnimatedCard>

                        {/* Premium Upgrade */}
                        <AnimatedCard
                            gradient="rainbow"
                            hover="glow"
                            className="animate-slideUp"
                            style={{ animationDelay: "0.4s" }}
                        >
                            <div className="text-center p-6">
                                <Sparkles className="h-10 w-10 text-white mx-auto mb-4" />
                                <h3 className="font-bold text-white text-lg mb-2">Upgrade to Premium</h3>
                                <p className="text-white/90 text-sm mb-4">
                                    Unlock advanced features and personalized insights
                                </p>
                                <Button variant="secondary" className="w-full">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Upgrade Now
                                </Button>
                            </div>
                        </AnimatedCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
