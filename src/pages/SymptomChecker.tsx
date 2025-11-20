import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, X, Plus, ArrowRight, ArrowLeft, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Symptom {
  name: string;
  id: string;
}

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", "Dizziness",
  "Chest Pain", "Shortness of Breath", "Abdominal Pain", "Back Pain",
  "Sore Throat", "Runny Nose", "Body Aches", "Loss of Appetite",
  "Difficulty Sleeping", "Skin Rash", "Joint Pain", "Muscle Pain",
  "Chills", "Sweating", "Vomiting", "Diarrhea", "Constipation",
  "Blurred Vision", "Ear Pain", "Toothache"
];

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [durationValue, setDurationValue] = useState("1");
  const [durationUnit, setDurationUnit] = useState<"hours" | "days" | "weeks">("days");
  const [bodyArea, setBodyArea] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Filter symptoms as user types
  useEffect(() => {
    if (currentSymptom.trim()) {
      const filtered = COMMON_SYMPTOMS.filter(s =>
        s.toLowerCase().includes(currentSymptom.toLowerCase()) &&
        !symptoms.find(sym => sym.name.toLowerCase() === s.toLowerCase())
      );
      setFilteredSymptoms(filtered.slice(0, 5));
    } else {
      setFilteredSymptoms([]);
    }
  }, [currentSymptom, symptoms]);

  const addSymptom = (symptomName?: string) => {
    const name = symptomName || currentSymptom.trim();
    if (name) {
      setSymptoms([...symptoms, { name, id: Date.now().toString() }]);
      setCurrentSymptom("");
      setFilteredSymptoms([]);
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const addCommonSymptom = (symptomName: string) => {
    if (!symptoms.find(s => s.name.toLowerCase() === symptomName.toLowerCase())) {
      setSymptoms([...symptoms, { name: symptomName, id: Date.now().toString() }]);
    }
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) {
      toast.error("Please add at least one symptom");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create symptom check
      const { data: checkData, error: checkError } = await supabase
        .from("symptom_checks")
        .insert({
          user_id: session.user.id,
          symptoms: symptoms as any,
          severity,
          duration_value: parseInt(durationValue),
          duration_unit: durationUnit,
          body_area: bodyArea || null,
          additional_notes: additionalNotes || null,
        })
        .select()
        .single();

      if (checkError) throw checkError;

      // Call AI analysis function
      toast.info("Analyzing your symptoms...");

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("analyze-symptoms", {
        body: {
          symptoms: symptoms.map(s => s.name),
          severity,
          duration: `${durationValue} ${durationUnit}`,
          bodyArea,
          additionalNotes,
          checkId: checkData.id,
        },
      });

      if (aiError) throw aiError;

      toast.success("Analysis complete!");
      navigate(`/results/${checkData.id}`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to analyze symptoms");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions = [
    {
      value: "mild",
      label: "Mild",
      description: "Minor discomfort",
      color: "bg-success/20 border-success text-success",
      emoji: "😊"
    },
    {
      value: "moderate",
      label: "Moderate",
      description: "Noticeable discomfort",
      color: "bg-warning/20 border-warning text-warning",
      emoji: "😐"
    },
    {
      value: "severe",
      label: "Severe",
      description: "Significant pain",
      color: "bg-destructive/20 border-destructive text-destructive",
      emoji: "😣"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-20" />

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
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-8 animate-slideUp">
          <h1 className="text-4xl font-bold mb-2">
            Symptom <span className="text-gradient">Checker</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about your symptoms to get personalized health insights
          </p>

          {/* Enhanced Progress indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                      ? "gradient-primary text-white scale-110"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > s ? "gradient-primary" : "bg-muted"
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Symptoms
              </span>
              <span className={step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Details
              </span>
              <span className={step >= 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <AnimatedCard hover="lift" className="animate-scaleIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What symptoms are you experiencing?
              </CardTitle>
              <CardDescription>
                Add all symptoms that concern you. Be as specific as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="symptom">Enter a symptom</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      id="symptom"
                      placeholder="e.g., Headache, Fever, Cough"
                      value={currentSymptom}
                      onChange={(e) => setCurrentSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                      className="flex-1"
                    />
                    <Button onClick={() => addSymptom()} className="gradient-primary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Autocomplete suggestions */}
                  {filteredSymptoms.length > 0 && (
                    <div className="absolute w-full mt-1 glass-strong border border-border rounded-lg shadow-lg z-10">
                      {filteredSymptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                          onClick={() => addSymptom(symptom)}
                        >
                          {symptom}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {symptoms.length > 0 && (
                <div className="space-y-2 animate-slideUp">
                  <Label>Your symptoms ({symptoms.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <Badge
                        key={symptom.id}
                        variant="secondary"
                        className="px-3 py-2 text-sm hover-scale"
                      >
                        {symptom.name}
                        <button
                          onClick={() => removeSymptom(symptom.id)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Common symptoms</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.slice(0, 12).map((symptom) => (
                    <Badge
                      key={symptom}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all hover-scale"
                      onClick={() => addCommonSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={symptoms.length === 0}
                  className="gradient-primary hover-lift group"
                  size="lg"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <AnimatedCard hover="lift" className="animate-scaleIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Provide more details
              </CardTitle>
              <CardDescription>
                Help us understand the severity and duration of your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Severity Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {severityOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSeverity(option.value as any)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover-lift ${severity === option.value
                          ? option.color
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{option.emoji}</div>
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-xs opacity-80">{option.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration-value">Duration</Label>
                  <Input
                    id="duration-value"
                    type="number"
                    min="1"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration-unit">Unit</Label>
                  <Select value={durationUnit} onValueChange={(v: any) => setDurationUnit(v)}>
                    <SelectTrigger id="duration-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-area">Body area (optional)</Label>
                <Input
                  id="body-area"
                  placeholder="e.g., Head, Chest, Abdomen"
                  value={bodyArea}
                  onChange={(e) => setBodyArea(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other relevant information..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="hover-scale">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="gradient-primary hover-lift group">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <AnimatedCard hover="lift" className="animate-scaleIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Review your information
              </CardTitle>
              <CardDescription>
                Please review before submitting for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="glass p-4 rounded-lg">
                <Label className="text-base font-semibold mb-3 block">Symptoms</Label>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <Badge key={symptom.id} className="gradient-primary text-white px-3 py-1.5">
                      {symptom.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-lg">
                  <Label className="text-base font-semibold mb-2 block">Severity</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {severityOptions.find(o => o.value === severity)?.emoji}
                    </span>
                    <span className="capitalize font-medium">{severity}</span>
                  </div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <Label className="text-base font-semibold mb-2 block">Duration</Label>
                  <p className="font-medium">
                    {durationValue} {durationUnit}
                  </p>
                </div>
              </div>

              {bodyArea && (
                <div className="glass p-4 rounded-lg">
                  <Label className="text-base font-semibold mb-2 block">Body Area</Label>
                  <p className="font-medium">{bodyArea}</p>
                </div>
              )}

              {additionalNotes && (
                <div className="glass p-4 rounded-lg">
                  <Label className="text-base font-semibold mb-2 block">Additional Notes</Label>
                  <p className="text-muted-foreground">{additionalNotes}</p>
                </div>
              )}

              <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-warning mb-1">Emergency Warning</p>
                    <p className="text-muted-foreground">
                      If you're experiencing severe chest pain, difficulty breathing, or other emergency symptoms, please call emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="hover-scale">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gradient-rainbow hover-lift group"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      Get AI Analysis
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;