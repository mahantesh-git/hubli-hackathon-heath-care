import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Shield, Activity, Clock, Heart, AlertCircle, CheckCircle2,
  Sparkles, TrendingUp, Users, Award, ArrowRight, Star,
  MessageCircle, Zap
} from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCard } from "@/components/AnimatedCard";
import { StatsCounter } from "@/components/StatsCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxSection } from "@/components/ParallaxSection";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
import { useEffect, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Health Enthusiast",
      content: "HealthCheck helped me identify early symptoms and get the care I needed. The AI analysis is incredibly accurate!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Busy Professional",
      content: "As someone with a hectic schedule, having 24/7 access to symptom checking is invaluable. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Parent",
      content: "Peace of mind for my family's health. The interface is intuitive and the insights are helpful.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg" : "bg-transparent"
        }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 animate-slideRight">
            <div className="w-10 h-10 rounded-full gradient-rainbow flex items-center justify-center animate-float">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">HealthCheck</span>
          </div>
          <div className="flex gap-3 items-center animate-slideLeft">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hover-scale">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth?tab=signup")} className="gradient-primary hover-glow">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <ParallaxSection speed={0.3}>
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <ScrollReveal animation="slideDown">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-gradient-primary">HIPAA-Aware Design</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fadeScale" delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Your Personal Health
                <span className="text-gradient block mt-2 animate-gradientShift">Symptom Checker</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="slideUp" delay={0.2}>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get instant AI-powered health insights based on your symptoms. Track your health history and receive personalized recommendations.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="bounceIn" delay={0.3}>
              <div className="flex gap-4 justify-center flex-wrap mb-12">
                <Button
                  size="lg"
                  className="text-lg gradient-primary hover-lift ripple group"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  Start Free Check
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg hover-scale glass"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </div>
            </ScrollReveal>

            {/* Stats with Stagger Animation */}
            <ScrollReveal animation="fadeIn" delay={0.4}>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                <div className="text-center stagger-1 animate-slideUp">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    <StatsCounter end={50000} suffix="+" />
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center stagger-2 animate-slideUp">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    <StatsCounter end={98} suffix="%" />
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="text-center stagger-3 animate-slideUp">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    <StatsCounter end={24} suffix="/7" />
                  </div>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Medical Disclaimer */}
            <ScrollReveal animation="slideUp" delay={0.5}>
              <div className="mt-12 p-4 glass rounded-lg text-sm text-left max-w-2xl mx-auto border-l-4 border-warning">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning mb-1">Medical Disclaimer</p>
                    <p className="text-muted-foreground">
                      This tool provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician with any questions about a medical condition. In case of emergency, call emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </ParallaxSection>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to get personalized health insights
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollReveal animation="slideUp" delay={0.1}>
              <AnimatedCard
                hover="tilt"
                icon={
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                }
                title="1. Describe Symptoms"
                description="Enter your symptoms, severity, and duration. Add as many details as you need for accurate analysis."
              />
            </ScrollReveal>

            <ScrollReveal animation="slideUp" delay={0.2}>
              <AnimatedCard
                hover="tilt"
                icon={
                  <div className="w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                }
                title="2. AI Analysis"
                description="Our AI analyzes your symptoms and provides preliminary health insights with urgency indicators."
              />
            </ScrollReveal>

            <ScrollReveal animation="slideUp" delay={0.3}>
              <AnimatedCard
                hover="tilt"
                icon={
                  <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                }
                title="3. Track History"
                description="Keep a complete timeline of your health checks. Monitor patterns and share with your healthcare provider."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Why Choose <span className="text-gradient">HealthCheck</span>?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "AI-powered symptom analysis" },
                  { icon: TrendingUp, text: "Comprehensive health history tracking" },
                  { icon: AlertCircle, text: "Clear urgency indicators" },
                  { icon: Shield, text: "Secure and private data storage" },
                  { icon: Users, text: "Easy sharing with healthcare providers" },
                  { icon: Clock, text: "Available 24/7 when you need it" }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-foreground text-lg">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatedCard hover="glow" gradient="primary">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">Quick Check</p>
                    <p className="text-white/90">Get results in seconds</p>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard hover="glow" gradient="secondary">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">Private & Secure</p>
                    <p className="text-white/90">Your data is encrypted</p>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard hover="glow" gradient="accent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">Track Progress</p>
                    <p className="text-white/90">Monitor your health journey</p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-muted-foreground">Trusted by thousands of health-conscious individuals</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${index === activeTestimonial
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute inset-0"
                    }`}
                >
                  <AnimatedCard hover="lift" className="text-center p-8">
                    <div className="flex justify-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === activeTestimonial
                    ? "w-8 bg-primary"
                    : "bg-muted-foreground/30"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto glass-strong p-12 rounded-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Take Control of Your <span className="text-gradient">Health</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who trust HealthCheck for preliminary health insights.
            </p>
            <Button
              size="lg"
              className="text-lg gradient-rainbow hover-lift group"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full gradient-rainbow flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gradient">HealthCheck</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted companion for health symptom analysis and tracking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 HealthCheck. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Menu */}
      <FloatingActionMenu />
    </div>
  );
};

export default Landing;