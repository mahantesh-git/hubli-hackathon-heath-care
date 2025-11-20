import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart, ArrowLeft, AlertTriangle, CheckCircle2, Stethoscope,
  MapPin, Phone, Navigation, Clock, Star, Building2, Pill, Loader2, Download,
  ChevronDown, ChevronUp, Lightbulb, UserCheck, Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AnimatedButton } from "@/components/AnimatedButton";
import { toast } from "sonner";
import { exportResultToPDF } from "@/lib/pdfExport";
import { generateHealthInsights, type HealthInsights } from "@/lib/healthInsights";

interface SymptomCheck {
  id: string;
  symptoms: any[];
  severity: string;
  duration_value: number;
  duration_unit: string;
  body_area: string | null;
  created_at: string;
}

interface Suggestion {
  id: string;
  suggestions_text: string;
  urgency_level: string;
  possible_conditions: any[] | null;
  home_remedies: any[] | null;
}

interface Doctor {
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  address: string;
  phone: string;
  placeId: string;
}

interface MedicalFacility {
  name: string;
  type: "hospital" | "pharmacy";
  distance: string;
  address: string;
  phone: string;
  open24h: boolean;
  rating: number;
  placeId: string;
}

const Results = () => {
  const { checkId } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState<SymptomCheck | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [showDeepInsight, setShowDeepInsight] = useState(false);

  // Google Places API key - In production, use environment variable
  const GOOGLE_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY"; // User needs to add their key

  useEffect(() => {
    const fetchResults = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: checkData } = await supabase
        .from("symptom_checks")
        .select("*")
        .eq("id", checkId)
        .single();

      if (checkData) {
        setCheck(checkData as any);

        const { data: suggestionData } = await supabase
          .from("suggestions")
          .select("*")
          .eq("check_id", checkId)
          .single();

        if (suggestionData) {
          setSuggestion(suggestionData as any);

          // Generate health insights
          const conditions = Array.isArray(suggestionData.possible_conditions)
            ? suggestionData.possible_conditions as string[]
            : ["General Health Concern"];
          const healthInsights = generateHealthInsights(
            conditions,
            checkData.symptoms as any[],
            checkData.severity,
            suggestionData.urgency_level,
            suggestionData.suggestions_text
          );
          setInsights(healthInsights);
        }
      }

      setIsLoading(false);
    };

    fetchResults();
  }, [checkId, navigate]);

  useEffect(() => {
    // Get user location and fetch nearby doctors/facilities
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          fetchNearbyDoctors(location);
          fetchNearbyFacilities(location);
        },
        (error) => {
          console.error("Location access denied:", error);
          toast.error("Please enable location access to find nearby doctors and facilities");
          setLoadingDoctors(false);
          setLoadingFacilities(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setLoadingDoctors(false);
      setLoadingFacilities(false);
    }
  }, []);

  const fetchNearbyDoctors = async (location: { lat: number, lng: number }) => {
    try {
      // Using Google Places API Nearby Search
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${location.lat},${location.lng}&` +
        `radius=5000&` +
        `type=doctor&` +
        `key=${GOOGLE_API_KEY}`,
        { mode: 'cors' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const doctorsList = data.results.slice(0, 3).map((place: any) => ({
          name: place.name,
          specialty: place.types?.includes('hospital') ? 'General Physician' : 'Medical Practitioner',
          rating: place.rating || 4.5,
          distance: calculateDistance(location, place.geometry.location),
          address: place.vicinity,
          phone: place.formatted_phone_number || 'Not available',
          placeId: place.place_id
        }));
        setDoctors(doctorsList);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to demo data if API fails
      setDoctors([
        {
          name: "Enable Google Places API",
          specialty: "Add your API key to see real doctors",
          rating: 0,
          distance: "N/A",
          address: "Configure GOOGLE_API_KEY in Results.tsx",
          phone: "N/A",
          placeId: ""
        }
      ]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchNearbyFacilities = async (location: { lat: number, lng: number }) => {
    try {
      // Fetch hospitals
      const hospitalsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${location.lat},${location.lng}&` +
        `radius=5000&` +
        `type=hospital&` +
        `key=${GOOGLE_API_KEY}`,
        { mode: 'cors' }
      );

      // Fetch pharmacies
      const pharmaciesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${location.lat},${location.lng}&` +
        `radius=3000&` +
        `type=pharmacy&` +
        `key=${GOOGLE_API_KEY}`,
        { mode: 'cors' }
      );

      const hospitalsData = await hospitalsResponse.json();
      const pharmaciesData = await pharmaciesResponse.json();

      const facilitiesList: MedicalFacility[] = [];

      // Add hospitals
      if (hospitalsData.results) {
        hospitalsData.results.slice(0, 2).forEach((place: any) => {
          facilitiesList.push({
            name: place.name,
            type: 'hospital',
            distance: calculateDistance(location, place.geometry.location),
            address: place.vicinity,
            phone: place.formatted_phone_number || 'Not available',
            open24h: place.opening_hours?.open_now || false,
            rating: place.rating || 4.0,
            placeId: place.place_id
          });
        });
      }

      // Add pharmacies
      if (pharmaciesData.results) {
        pharmaciesData.results.slice(0, 2).forEach((place: any) => {
          facilitiesList.push({
            name: place.name,
            type: 'pharmacy',
            distance: calculateDistance(location, place.geometry.location),
            address: place.vicinity,
            phone: place.formatted_phone_number || 'Not available',
            open24h: place.opening_hours?.open_now || false,
            rating: place.rating || 4.0,
            placeId: place.place_id
          });
        });
      }

      setFacilities(facilitiesList);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      // Fallback message
      setFacilities([
        {
          name: "Configure Google Places API",
          type: 'hospital',
          distance: "N/A",
          address: "Add your API key to see real facilities",
          phone: "N/A",
          open24h: false,
          rating: 0,
          placeId: ""
        }
      ]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const calculateDistance = (from: { lat: number, lng: number }, to: { lat: number, lng: number }): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;
  };

  const getUrgencyInfo = (level: string) => {
    switch (level) {
      case "emergency":
        return {
          color: "destructive",
          icon: AlertTriangle,
          text: "Seek Immediate Care",
          emoji: "🚨"
        };
      case "consult_doctor":
        return {
          color: "warning",
          icon: Stethoscope,
          text: "Consult a Doctor",
          emoji: "⚠️"
        };
      default:
        return {
          color: "success",
          icon: CheckCircle2,
          text: "Self-Care Recommended",
          emoji: "✅"
        };
    }
  };

  const handleCallDoctor = (phone: string) => {
    if (phone === 'Not available' || phone === 'N/A') {
      toast.error("Phone number not available");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleGetDirections = (address: string, placeId: string) => {
    if (placeId) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${placeId}`, '_blank');
    } else if (userLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(address)}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };
  const handleExportPDF = async () => {
    if (!check || !suggestion || !insights) return;

    setIsExporting(true);
    try {
      await exportResultToPDF(check, suggestion, insights);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your results..." />
      </div>
    );
  }

  if (!check || !suggestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-slideUp">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find your health analysis.</p>
          <Button onClick={() => navigate("/dashboard")} className="gradient-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const urgencyInfo = getUrgencyInfo(suggestion.urgency_level);
  const UrgencyIcon = urgencyInfo.icon;
  const conditions = suggestion.possible_conditions || ["General Health Concern"];
  const mainCondition = conditions[0];

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
            <AnimatedButton
              onClick={handleExportPDF}
              loading={isExporting}
              loadingText="Exporting..."
              variant="outline"
              ripple
              className="hover-scale"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </AnimatedButton>
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
        {/* Urgency Alert */}
        <AnimatedCard
          className={`mb-8 border-2 ${urgencyInfo.color === 'destructive' ? 'border-destructive bg-destructive/10' :
            urgencyInfo.color === 'warning' ? 'border-warning bg-warning/10' :
              'border-success bg-success/10'
            } animate-slideUp`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{urgencyInfo.emoji}</div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-1 ${urgencyInfo.color === 'destructive' ? 'text-destructive' :
                  urgencyInfo.color === 'warning' ? 'text-warning' :
                    'text-success'
                  }`}>
                  {urgencyInfo.text}
                </h2>
                <p className="text-muted-foreground">
                  Based on your symptoms: {check.symptoms.map(s => s.name).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* All Likely Conditions */}
            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-2xl">📋 Likely Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conditions.map((condition: string, index: number) => (
                    <div
                      key={index}
                      className={`p-4 glass rounded-lg ${index === 0 ? 'border-2 border-primary' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge className={index === 0 ? "gradient-primary text-white" : "bg-muted"}>
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h3 className={`font-bold mb-1 ${index === 0 ? 'text-primary text-lg' : 'text-base'}`}>
                            {condition}
                          </h3>
                          {index === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {suggestion.suggestions_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Keywords & Insights */}
            {insights && (
              <>
                {/* Keywords */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.15s" }}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Medical Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1.5 text-sm border-primary/30 hover:bg-primary/10 transition-colors"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* General Insight */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-warning" />
                      Quick Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {insights.generalInsight}
                    </p>
                  </CardContent>
                </AnimatedCard>

                {/* Deep Insight - Expandable */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.25s" }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Detailed Analysis
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeepInsight(!showDeepInsight)}
                        className="hover-scale"
                      >
                        {showDeepInsight ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Insight
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showDeepInsight && (
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {insights.deepInsight.split('\n').map((paragraph, index) => (
                          <p key={index} className="text-muted-foreground leading-relaxed mb-3">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </AnimatedCard>

                {/* Doctor Recommendation */}
                <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-success" />
                      Recommended Doctor Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 glass rounded-lg border-2 border-success/30">
                      <h3 className="text-lg font-bold text-success mb-2">
                        {insights.doctorRecommendation.specialty}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insights.doctorRecommendation.reason}
                      </p>
                      {insights.doctorRecommendation.alternativeSpecialties &&
                        insights.doctorRecommendation.alternativeSpecialties.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Alternative Specialists:</p>
                            <div className="flex flex-wrap gap-2">
                              {insights.doctorRecommendation.alternativeSpecialties.map((alt, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </AnimatedCard>
              </>
            )}

            {/* Key Precautions */}
            {suggestion.home_remedies && suggestion.home_remedies.length > 0 && (
              <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.35s" }}>
                <CardHeader>
                  <CardTitle className="text-2xl">⚡ Key Precautions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestion.home_remedies.slice(0, 4).map((remedy: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-4 glass rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                        <p className="font-medium">{remedy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Nearby Doctors */}
            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-primary" />
                  Nearby Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDoctors ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Finding doctors near you...</span>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="space-y-3">
                    {doctors.map((doctor, index) => (
                      <div key={index} className="p-4 glass rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{doctor.name}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          </div>
                          {doctor.rating > 0 && (
                            <div className="flex items-center gap-1 text-warning">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {doctor.distance}
                          </div>
                          <p className="text-xs">{doctor.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCallDoctor(doctor.phone)}
                            className="flex-1 gradient-primary"
                            size="sm"
                            disabled={doctor.phone === 'Not available' || doctor.phone === 'N/A'}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            {doctor.phone === 'Not available' || doctor.phone === 'N/A' ? 'No Phone' : 'Call'}
                          </Button>
                          <Button
                            onClick={() => handleGetDirections(doctor.address, doctor.placeId)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No doctors found nearby. Please enable location access.</p>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Symptoms */}
            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle>Your Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {check.symptoms.map((symptom: any, index: number) => (
                  <Badge key={index} className="gradient-primary text-white px-3 py-1.5 mr-2 mb-2">
                    {symptom.name}
                  </Badge>
                ))}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <Badge variant="outline" className={`capitalize ${check.severity === 'severe' ? 'border-destructive text-destructive' :
                      check.severity === 'moderate' ? 'border-warning text-warning' :
                        'border-success text-success'
                      }`}>
                      {check.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{check.duration_value} {check.duration_unit}</span>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Nearby Facilities */}
            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Nearby Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFacilities ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : facilities.length > 0 ? (
                  <div className="space-y-3">
                    {facilities.map((facility, index) => (
                      <div key={index} className="p-3 glass rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          {facility.type === 'hospital' ? (
                            <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <Pill className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{facility.name}</h4>
                            <p className="text-xs text-muted-foreground">{facility.distance} away</p>
                            {facility.rating > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-warning fill-current" />
                                <span className="text-xs">{facility.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {facility.open24h && (
                              <Badge variant="outline" className="text-xs mt-1 border-success text-success">
                                Open Now
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleGetDirections(facility.address, facility.placeId)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Navigation className="mr-2 h-3 w-3" />
                          Get Directions
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    <p>No facilities found nearby.</p>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>

            {/* Quick Actions */}
            <AnimatedCard hover="lift" className="animate-slideUp" style={{ animationDelay: "0.6s" }}>
              <CardContent className="pt-6 space-y-2">
                <Button
                  onClick={() => navigate("/symptom-checker")}
                  className="w-full gradient-primary"
                >
                  New Check
                </Button>
                <Button
                  onClick={() => navigate("/history")}
                  variant="outline"
                  className="w-full"
                >
                  View History
                </Button>
              </CardContent>
            </AnimatedCard>
          </div>
        </div>

        {/* API Configuration Notice */}
        {doctors.length > 0 && doctors[0].name.includes("Enable Google") && (
          <div className="mt-8 p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
            <h4 className="font-semibold text-warning mb-2">⚠️ Google Places API Configuration Required</h4>
            <p className="text-sm text-muted-foreground mb-2">
              To show real doctors and medical facilities, you need to:
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Get a Google Places API key from Google Cloud Console</li>
              <li>Enable Places API and Maps JavaScript API</li>
              <li>Replace GOOGLE_API_KEY in Results.tsx with your key</li>
              <li>Set up billing (Google provides $200 free credit monthly)</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;