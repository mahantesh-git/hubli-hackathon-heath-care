# Google Places API Setup Guide

## 🔑 Get Real Doctor & Medical Facility Data

Your Results page is now configured to fetch **real-world doctors and medical facilities** using Google Places API. Follow these steps to enable it:

---

## Step 1: Get Google Places API Key

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it: "HealthCheck App"
4. Click "Create"

### 1.3 Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API** (optional, for better results)

### 1.4 Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### 1.5 Restrict API Key (Recommended for Security)
1. Click on your API key to edit
2. Under "API restrictions":
   - Select "Restrict key"
   - Check: Places API, Maps JavaScript API
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:8080/*` (for development)
   - Add your production domain when deploying
4. Click "Save"

---

## Step 2: Add API Key to Your Project

### Option A: Environment Variable (Recommended)

1. Create a `.env` file in your project root:
```bash
VITE_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
```

2. Update `Results.tsx` line 48:
```typescript
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
```

3. Restart your dev server:
```bash
npm run dev
```

### Option B: Direct Replacement (Quick Test)

1. Open `src/pages/Results.tsx`
2. Find line 48:
```typescript
const GOOGLE_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";
```

3. Replace with your actual key:
```typescript
const GOOGLE_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

4. Save the file

---

## Step 3: Enable Billing (Required)

Google Places API requires billing to be enabled, but don't worry:

### Free Tier Benefits:
- **$200 free credit** every month
- **28,500 free requests** per month for Places Nearby Search
- **40,000 free requests** per month for Places Details

### Enable Billing:
1. Go to "Billing" in Google Cloud Console
2. Click "Link a billing account"
3. Add a credit card (won't be charged unless you exceed free tier)
4. Confirm

**Note**: For a typical health app with moderate usage, you'll likely stay within the free tier.

---

## Step 4: Test the Integration

1. Complete a symptom check
2. View the results page
3. **Allow location access** when prompted
4. You should now see:
   - ✅ Real doctors near you
   - ✅ Real hospitals and pharmacies
   - ✅ Actual ratings and distances
   - ✅ Working "Call" and "Get Directions" buttons

---

## 🔧 How It Works

### Location Detection:
```javascript
navigator.geolocation.getCurrentPosition()
```
- Asks user for location permission
- Gets latitude and longitude
- Used to find nearby facilities

### Google Places API Calls:

**Find Doctors:**
```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
?location=LAT,LNG
&radius=5000
&type=doctor
&key=YOUR_API_KEY
```

**Find Hospitals:**
```
?type=hospital
```

**Find Pharmacies:**
```
?type=pharmacy
```

### Distance Calculation:
Uses Haversine formula to calculate distance between user and facility.

---

## 📊 What Data You'll Get

### For Each Doctor:
- ✅ Name
- ✅ Specialty (from place types)
- ✅ Rating (1-5 stars)
- ✅ Distance from user
- ✅ Address
- ✅ Phone number (if available)
- ✅ Place ID (for directions)

### For Each Facility:
- ✅ Name
- ✅ Type (Hospital/Pharmacy)
- ✅ Distance
- ✅ Address
- ✅ Phone number
- ✅ Open/Closed status
- ✅ Rating
- ✅ Place ID

---

## 🔒 Security Best Practices

### 1. Never Commit API Keys
Add to `.gitignore`:
```
.env
.env.local
```

### 2. Use Environment Variables
```typescript
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
```

### 3. Restrict API Key
- Limit to specific APIs
- Limit to specific domains
- Set usage quotas

### 4. Monitor Usage
- Check Google Cloud Console regularly
- Set up billing alerts
- Monitor for unusual activity

---

## 💰 Cost Estimation

### Typical Usage:
- **10 users/day** × **1 symptom check** = 10 requests/day
- **300 requests/month**
- **Cost**: $0 (well within free tier)

### High Usage:
- **1,000 users/day** × **1 check** = 1,000 requests/day
- **30,000 requests/month**
- **Cost**: ~$0-10/month (mostly free tier)

### Free Tier Limits:
- Places Nearby Search: **28,500 free/month**
- After that: **$32 per 1,000 requests**

---

## 🐛 Troubleshooting

### "API key not valid"
- Check if API key is correct
- Ensure Places API is enabled
- Check API key restrictions

### "This API project is not authorized"
- Enable billing on your Google Cloud project
- Wait 5-10 minutes after enabling

### "No doctors found"
- Check if location permission is granted
- Try a different location
- Increase search radius in code

### "CORS error"
- This is expected with direct API calls from browser
- Solution: Create a backend proxy (recommended for production)
- Or use Google Maps JavaScript SDK instead

---

## 🚀 Production Deployment

### For Production, Use a Backend Proxy:

1. Create an API endpoint on your server:
```javascript
// server.js
app.get('/api/nearby-doctors', async (req, res) => {
  const { lat, lng } = req.query;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${lat},${lng}&radius=5000&type=doctor&key=${process.env.GOOGLE_API_KEY}`
  );
  const data = await response.json();
  res.json(data);
});
```

2. Update Results.tsx to call your backend:
```typescript
const response = await fetch(`/api/nearby-doctors?lat=${lat}&lng=${lng}`);
```

### Benefits:
- ✅ Hides API key from client
- ✅ No CORS issues
- ✅ Better security
- ✅ Can add caching
- ✅ Can add rate limiting

---

## 📝 Summary

1. ✅ Get Google Places API key
2. ✅ Enable Places API & Maps API
3. ✅ Enable billing (free tier available)
4. ✅ Add key to `.env` file
5. ✅ Test with real location
6. ✅ See real doctors and facilities!

---

## 🆘 Need Help?

- **Google Places API Docs**: https://developers.google.com/maps/documentation/places/web-service
- **Pricing**: https://cloud.google.com/maps-platform/pricing
- **Support**: https://cloud.google.com/support

---

**Status**: Ready to fetch real-world medical data!
**Cost**: Free for typical usage (within $200/month credit)
**Setup Time**: 10-15 minutes

🎉 **Your app will now show real doctors and facilities!** 🎉
