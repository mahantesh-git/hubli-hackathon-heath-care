/**
 * Subscription Service
 * Manages user subscriptions and premium feature access
 */

import { supabase } from "@/integrations/supabase/client";

export type PlanType = "free" | "premium" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: PlanType;
    status: SubscriptionStatus;
    started_at: string | null;
    expires_at: string | null;
    trial_ends_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface PremiumFeatures {
    allConditions: boolean;
    keywords: boolean;
    generalInsight: boolean;
    deepInsight: boolean;
    doctorRecommendation: boolean;
    fullPrecautions: boolean;
    enhancedPDF: boolean;
    unlimitedChecks: boolean;
    prioritySupport: boolean;
    healthTrends: boolean;
    familyTracking: boolean;
}

/**
 * Get feature access based on plan type
 */
export const getPlanFeatures = (planType: PlanType): PremiumFeatures => {
    switch (planType) {
        case "pro":
            return {
                allConditions: true,
                keywords: true,
                generalInsight: true,
                deepInsight: true,
                doctorRecommendation: true,
                fullPrecautions: true,
                enhancedPDF: true,
                unlimitedChecks: true,
                prioritySupport: true,
                healthTrends: true,
                familyTracking: true,
            };
        case "premium":
            return {
                allConditions: true,
                keywords: true,
                generalInsight: true,
                deepInsight: true,
                doctorRecommendation: true,
                fullPrecautions: true,
                enhancedPDF: true,
                unlimitedChecks: true,
                prioritySupport: true,
                healthTrends: false,
                familyTracking: false,
            };
        case "free":
        default:
            return {
                allConditions: false,
                keywords: false,
                generalInsight: false,
                deepInsight: false,
                doctorRecommendation: false,
                fullPrecautions: false,
                enhancedPDF: false,
                unlimitedChecks: false,
                prioritySupport: false,
                healthTrends: false,
                familyTracking: false,
            };
    }
};

/**
 * Get user's current subscription
 */
export const getUserSubscription = async (
    userId: string
): Promise<Subscription | null> => {
    try {
        const { data, error } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching subscription:", error);
            return null;
        }

        return data as Subscription;
    } catch (error) {
        console.error("Error in getUserSubscription:", error);
        return null;
    }
};

/**
 * Check if user has premium access
 */
export const hasPremiumAccess = async (userId: string): Promise<boolean> => {
    const subscription = await getUserSubscription(userId);

    if (!subscription) return false;

    // Check if subscription is active
    if (subscription.status !== "active" && subscription.status !== "trial") {
        return false;
    }

    // Check if trial has expired
    if (subscription.status === "trial" && subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        if (trialEnd < new Date()) {
            return false;
        }
    }

    // Check if subscription has expired
    if (subscription.expires_at) {
        const expiryDate = new Date(subscription.expires_at);
        if (expiryDate < new Date()) {
            return false;
        }
    }

    return subscription.plan_type === "premium" || subscription.plan_type === "pro";
};

/**
 * Get user's plan type
 */
export const getUserPlanType = async (userId: string): Promise<PlanType> => {
    const subscription = await getUserSubscription(userId);

    if (!subscription) return "free";

    // Check if subscription is still valid
    if (subscription.status !== "active" && subscription.status !== "trial") {
        return "free";
    }

    // Check expiry
    if (subscription.expires_at) {
        const expiryDate = new Date(subscription.expires_at);
        if (expiryDate < new Date()) {
            return "free";
        }
    }

    return subscription.plan_type;
};

/**
 * Get user's premium features
 */
export const getUserFeatures = async (
    userId: string
): Promise<PremiumFeatures> => {
    const planType = await getUserPlanType(userId);
    return getPlanFeatures(planType);
};

/**
 * Upgrade user subscription (Mock payment - replace with real payment gateway)
 */
export const upgradeSubscription = async (
    userId: string,
    newPlan: PlanType
): Promise<{ success: boolean; message: string }> => {
    try {
        // Calculate expiry date (30 days for monthly subscription)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error } = await supabase
            .from("subscriptions")
            .update({
                plan_type: newPlan,
                status: "active",
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        if (error) {
            console.error("Error upgrading subscription:", error);
            return { success: false, message: "Failed to upgrade subscription" };
        }

        return { success: true, message: `Successfully upgraded to ${newPlan}!` };
    } catch (error) {
        console.error("Error in upgradeSubscription:", error);
        return { success: false, message: "An error occurred" };
    }
};

/**
 * Cancel user subscription
 */
export const cancelSubscription = async (
    userId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const { error } = await supabase
            .from("subscriptions")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        if (error) {
            console.error("Error cancelling subscription:", error);
            return { success: false, message: "Failed to cancel subscription" };
        }

        return {
            success: true,
            message: "Subscription cancelled. You'll have access until the end of your billing period.",
        };
    } catch (error) {
        console.error("Error in cancelSubscription:", error);
        return { success: false, message: "An error occurred" };
    }
};

/**
 * Start free trial (7 days)
 */
export const startFreeTrial = async (
    userId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        // Check if user already had a trial
        const subscription = await getUserSubscription(userId);
        if (subscription && subscription.trial_ends_at) {
            return { success: false, message: "You've already used your free trial" };
        }

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        const { error } = await supabase
            .from("subscriptions")
            .update({
                plan_type: "premium",
                status: "trial",
                trial_ends_at: trialEndsAt.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        if (error) {
            console.error("Error starting trial:", error);
            return { success: false, message: "Failed to start trial" };
        }

        return {
            success: true,
            message: "7-day premium trial started! Enjoy all premium features.",
        };
    } catch (error) {
        console.error("Error in startFreeTrial:", error);
        return { success: false, message: "An error occurred" };
    }
};

/**
 * Get plan pricing
 */
export const getPlanPricing = () => {
    return {
        free: {
            price: 0,
            currency: "$",
            period: "forever",
            features: [
                "Basic symptom checker",
                "1 likely condition",
                "2 precautions",
                "Basic AI analysis",
                "5 checks per month",
            ],
        },
        premium: {
            price: 4.99,
            currency: "$",
            period: "month",
            features: [
                "Everything in Free",
                "All likely conditions",
                "Medical keywords",
                "General & detailed insights",
                "Doctor recommendations",
                "Full precautions",
                "Unlimited checks",
                "Enhanced PDF export",
                "Priority support",
            ],
        },
        pro: {
            price: 9.99,
            currency: "$",
            period: "month",
            features: [
                "Everything in Premium",
                "AI-powered health trends",
                "Personalized health reports",
                "Family health tracking (5 members)",
                "Direct doctor consultation",
                "Health data export",
                "24/7 priority support",
            ],
        },
    };
};

/**
 * Get days remaining in subscription
 */
export const getDaysRemaining = (subscription: Subscription | null): number => {
    if (!subscription || !subscription.expires_at) return 0;

    const expiryDate = new Date(subscription.expires_at);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
};
