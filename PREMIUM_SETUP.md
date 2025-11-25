# Premium Subscription System - Setup Guide

## Overview
The premium subscription system has been successfully implemented! This guide will help you set up the database and test the features.

## 🚀 Quick Start

### Step 1: Run Database Migration

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration Script**
   - Copy the entire contents of `supabase/migrations/create_subscriptions.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify the Migration**
   - Go to "Table Editor" in the left sidebar
   - You should see a new `subscriptions` table
   - The `profiles` table should have a new `premium_tier` column

### Step 2: Test the Features

#### Testing as a Free User
1. Create a new account or use an existing one
2. Perform a symptom check
3. On the Results page, you should see:
   - ✅ Basic condition display (first condition only)
   - ❌ Keywords section (locked with blur effect)
   - ❌ Quick Insight (locked)
   - ❌ Detailed Analysis (locked)
   - ❌ Doctor Recommendations (locked)
4. Click any "Unlock Premium" button to see the pricing modal

#### Testing Premium Upgrade
1. Click "Unlock Premium" on any locked feature
2. In the modal, click "Upgrade Now" on the Premium plan
3. The system will simulate a payment and upgrade your account
4. All premium features should now be unlocked!

#### Testing Free Trial
1. As a free user, click "Start 7-Day Free Trial" in the premium modal
2. You'll get 7 days of premium access
3. All features will be unlocked during the trial period

## 📋 Features by Plan

### Free Plan
- ✅ Basic symptom checker
- ✅ 1 likely condition
- ✅ 2 precautions
- ✅ Basic AI analysis
- ✅ 5 checks per month
- ❌ No keywords
- ❌ No detailed insights
- ❌ No doctor recommendations

### Premium Plan ($4.99/month)
- ✅ Everything in Free
- ✅ All likely conditions
- ✅ Medical keywords
- ✅ General & detailed insights
- ✅ Doctor recommendations
- ✅ Full precautions
- ✅ Unlimited checks
- ✅ Enhanced PDF export
- ✅ Priority support

### Pro Plan ($9.99/month)
- ✅ Everything in Premium
- ✅ AI-powered health trends
- ✅ Personalized reports
- ✅ Family tracking (5 members)
- ✅ Direct doctor consultation
- ✅ Health data export
- ✅ 24/7 priority support

## 🔧 Manual Testing Checklist

- [ ] Database migration completed successfully
- [ ] Free user sees locked features with blur effect
- [ ] Premium modal opens when clicking "Unlock Premium"
- [ ] Upgrade to Premium works (mock payment)
- [ ] Premium features unlock after upgrade
- [ ] Free trial activation works
- [ ] Premium badges appear on unlocked features
- [ ] PDF export includes premium content for premium users

## 🎨 UI Components Created

1. **PremiumModal** - Pricing tiers and upgrade interface
2. **PremiumBadge** - Crown icon badge for premium features
3. **LockedFeature** - Blur overlay with unlock button

## 📁 Files Created/Modified

### New Files
- `src/lib/subscriptionService.ts` - Subscription management
- `src/components/PremiumModal.tsx` - Pricing modal
- `src/components/PremiumBadge.tsx` - Premium badge component
- `src/components/LockedFeature.tsx` - Feature locking component
- `supabase/migrations/create_subscriptions.sql` - Database schema

### Modified Files
- `src/pages/Results.tsx` - Added premium feature gating
- `src/integrations/supabase/types.ts` - Added subscriptions table types
- `src/lib/pdfExport.ts` - Enhanced PDF for premium users

## 💳 Payment Integration (Future)

Currently using **mock payments** for demonstration. To integrate real payments:

### Option 1: Stripe (Recommended for Global)
```bash
npm install @stripe/stripe-js
```
- Update `subscriptionService.ts` with Stripe API calls
- Add Stripe publishable key to environment variables
- Implement webhook handlers for subscription events

### Option 2: Razorpay (Recommended for India)
```bash
npm install razorpay
```
- Update `subscriptionService.ts` with Razorpay API calls
- Add Razorpay key to environment variables
- Implement payment verification

## 🐛 Troubleshooting

### Issue: "subscriptions table does not exist"
**Solution:** Run the database migration script in Supabase SQL Editor

### Issue: Features not unlocking after upgrade
**Solution:** 
1. Check browser console for errors
2. Verify subscription record in Supabase Table Editor
3. Refresh the page to reload subscription status

### Issue: Premium modal not showing
**Solution:**
1. Ensure user is logged in
2. Check that `userId` state is set
3. Verify Dialog component is imported correctly

## 📊 Database Schema

### subscriptions table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to profiles)
- plan_type: TEXT ('free', 'premium', 'pro')
- status: TEXT ('active', 'cancelled', 'expired', 'trial')
- started_at: TIMESTAMP
- expires_at: TIMESTAMP
- trial_ends_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### profiles table (updated)
```sql
- premium_tier: TEXT (synced with subscription plan_type)
```

## 🎯 Next Steps

1. **Run the database migration** (most important!)
2. **Test the free user experience**
3. **Test the upgrade flow**
4. **Consider integrating real payment gateway**
5. **Add subscription management to Settings page**
6. **Implement usage limits for free tier**

## 💡 Tips

- The system automatically creates a free subscription for new users
- Trial periods are 7 days by default
- Subscriptions expire after 30 days (monthly billing)
- Premium features are checked on page load and after upgrades

---

**Need Help?** Check the implementation plan in the artifacts directory for detailed technical information.
