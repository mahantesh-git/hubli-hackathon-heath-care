import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Sparkles, Zap, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlanPricing, upgradeSubscription, startFreeTrial } from "@/lib/subscriptionService";
import { toast } from "sonner";

interface PremiumModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentPlan?: string;
    onUpgradeSuccess?: () => void;
}

export const PremiumModal = ({
    open,
    onOpenChange,
    userId,
    currentPlan = "free",
    onUpgradeSuccess,
}: PremiumModalProps) => {
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<"premium" | "pro" | null>(null);
    const pricing = getPlanPricing();

    const handleUpgrade = async (plan: "premium" | "pro") => {
        setIsUpgrading(true);
        setSelectedPlan(plan);

        try {
            const result = await upgradeSubscription(userId, plan);

            if (result.success) {
                toast.success(result.message);
                onOpenChange(false);
                if (onUpgradeSuccess) {
                    onUpgradeSuccess();
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to upgrade subscription");
        } finally {
            setIsUpgrading(false);
            setSelectedPlan(null);
        }
    };

    const handleStartTrial = async () => {
        setIsUpgrading(true);

        try {
            const result = await startFreeTrial(userId);

            if (result.success) {
                toast.success(result.message);
                onOpenChange(false);
                if (onUpgradeSuccess) {
                    onUpgradeSuccess();
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to start trial");
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                        <Crown className="h-8 w-8 text-warning" />
                        Unlock Premium Features
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Get detailed health insights, doctor recommendations, and unlimited symptom checks
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    {/* Free Plan */}
                    <Card className={`relative ${currentPlan === "free" ? "border-2 border-primary" : ""}`}>
                        {currentPlan === "free" && (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                                Current Plan
                            </Badge>
                        )}
                        <CardContent className="pt-6">
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold mb-2">Free</h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${pricing.free.price}
                                </div>
                                <p className="text-sm text-muted-foreground">{pricing.free.period}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {pricing.free.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                Current Plan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Premium Plan */}
                    <Card className={`relative border-2 ${currentPlan === "premium" ? "border-primary" : "border-warning"}`}>
                        {currentPlan === "premium" ? (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                                Current Plan
                            </Badge>
                        ) : (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-primary text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Most Popular
                            </Badge>
                        )}
                        <CardContent className="pt-6">
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                                    <Crown className="h-5 w-5 text-warning" />
                                    Premium
                                </h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${pricing.premium.price}
                                </div>
                                <p className="text-sm text-muted-foreground">per {pricing.premium.period}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {pricing.premium.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                                        <span className={index === 0 ? "font-semibold" : ""}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {currentPlan === "free" && (
                                <div className="space-y-2">
                                    <Button
                                        className="w-full gradient-primary"
                                        onClick={() => handleUpgrade("premium")}
                                        disabled={isUpgrading}
                                    >
                                        {isUpgrading && selectedPlan === "premium" ? "Processing..." : "Upgrade Now"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleStartTrial}
                                        disabled={isUpgrading}
                                    >
                                        Start 7-Day Free Trial
                                    </Button>
                                </div>
                            )}
                            {currentPlan === "premium" && (
                                <Button variant="outline" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            )}
                            {currentPlan === "pro" && (
                                <Button variant="outline" className="w-full" disabled>
                                    Downgrade
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className={`relative ${currentPlan === "pro" ? "border-2 border-primary" : ""}`}>
                        {currentPlan === "pro" && (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                                Current Plan
                            </Badge>
                        )}
                        <CardContent className="pt-6">
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    Pro
                                </h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${pricing.pro.price}
                                </div>
                                <p className="text-sm text-muted-foreground">per {pricing.pro.period}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {pricing.pro.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span className={index === 0 ? "font-semibold" : ""}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {currentPlan !== "pro" && (
                                <Button
                                    className="w-full gradient-rainbow"
                                    onClick={() => handleUpgrade("pro")}
                                    disabled={isUpgrading}
                                >
                                    {isUpgrading && selectedPlan === "pro" ? "Processing..." : "Upgrade to Pro"}
                                </Button>
                            )}
                            {currentPlan === "pro" && (
                                <Button variant="outline" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-center text-muted-foreground">
                        <strong>Note:</strong> This is a demo payment system. In production, integrate with Stripe or Razorpay for real payments.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
