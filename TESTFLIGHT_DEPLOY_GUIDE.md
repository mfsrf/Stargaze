# Stargaze - TestFlight Deployment Guide

This guide will walk you through deploying your Stargaze app to TestFlight for beta testing.

## Prerequisites

### 1. Apple Developer Account
- Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
- Complete your account setup at [developer.apple.com](https://developer.apple.com)

### 2. App Store Connect Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click the "+" button to create a new app
3. Fill in the app details:
   - **Platform:** iOS
   - **Name:** Stargaze
   - **Primary Language:** English
   - **Bundle ID:** `com.mfsrf.stargaze` (must match app.json)
   - **SKU:** `stargaze-001` (your choice, but must be unique)
   - **User Access:** Full Access

### 3. Install EAS CLI
```bash
npm install -g eas-cli
```

## Step-by-Step Deployment

### Step 1: Login to Expo Account
```bash
# Create an account at expo.dev if you don't have one
eas login
```

### Step 2: Configure EAS Project
```bash
# Initialize EAS in your project
eas build:configure
```

This will:
- Update your `app.json` with a unique project ID
- Ensure `eas.json` is properly configured

### Step 3: Prepare iOS Credentials

You need to set up Apple credentials. EAS can manage this for you:

```bash
eas credentials
```

Choose:
- **Platform:** iOS
- **Action:** Set up credentials for your app

EAS will guide you through:
- Creating an App Identifier
- Creating a Provisioning Profile
- Creating/uploading a Distribution Certificate

**Or manually provide:**
- Apple Team ID (found in [Apple Developer Account](https://developer.apple.com/account))
- App Store Connect API Key (created in [App Store Connect > Users and Access > Keys](https://appstoreconnect.apple.com/access/api))

### Step 4: Create App Icons (if not done)

Before building, ensure you have:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)

See `ASSETS_GUIDE.md` for details.

### Step 5: Build for TestFlight

#### Option A: Build for Preview/Internal Testing
```bash
npm run build:ios:preview
```

This creates an internal distribution build you can install on registered devices.

#### Option B: Build for Production (TestFlight)
```bash
npm run build:ios:production
```

This creates a production build ready for TestFlight and App Store.

**Build Process:**
- EAS will upload your code to their servers
- Build takes 10-30 minutes
- You'll get a notification when complete
- You can monitor progress at [expo.dev/builds](https://expo.dev/builds)

### Step 6: Submit to TestFlight

After your build succeeds:

#### Automatic Submission:
```bash
npm run submit:ios
```

This will:
- Prompt for your Apple ID credentials
- Upload the build to App Store Connect
- Submit to TestFlight review (usually 24-48 hours)

#### Manual Submission:
1. Download the `.ipa` file from your EAS build
2. Go to [App Store Connect](https://appstoreconnect.apple.com)
3. Select your app
4. Go to TestFlight tab
5. Click "+" to add a new build
6. Upload your `.ipa` file

### Step 7: Configure TestFlight

Once your build is approved:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) > TestFlight
2. Select your build
3. Add "Test Information":
   - What to test
   - App description
   - Feedback email
   - Marketing URL (optional)
4. Add Testers:
   - **Internal Testing:** Add your team members (Apple Developer Program members)
   - **External Testing:** Add up to 10,000 external beta testers

### Step 8: Invite Testers

#### Internal Testers:
- No review required
- Available immediately after build is processed
- Add via "App Store Connect Users" section

#### External Testers:
- Requires Apple review (24-48 hours)
- Add individual emails or create groups
- Testers receive invitation via email

## Common Issues & Solutions

### Issue: "Bundle identifier is already in use"
**Solution:** Change the bundle identifier in `app.json` under `ios.bundleIdentifier`

### Issue: "No credentials configured"
**Solution:** Run `eas credentials` and follow the setup wizard

### Issue: "Build failed with exit code 65"
**Solution:** 
- Check that all dependencies are compatible with iOS
- Run `npm run prebuild:ios` locally to check for errors
- Review build logs at expo.dev/builds

### Issue: "Icon not found"
**Solution:** Ensure `assets/icon.png` exists and is exactly 1024x1024 pixels

## Build Profiles Explained

Your `eas.json` contains three build profiles:

### 1. `development`
- For local development on simulator
- Includes dev tools
- **Command:** `npm run build:ios:simulator`

### 2. `preview`
- For internal testing on real devices
- Distribution: Internal
- **Command:** `npm run build:ios:preview`

### 3. `production`
- For TestFlight and App Store
- Optimized and minified
- **Command:** `npm run build:ios:production`

## Updating Your App

When you want to push an update:

1. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "ios": {
         "buildNumber": "2"
       }
     }
   }
   ```

2. Commit your changes:
   ```bash
   git add .
   git commit -m "Version 1.0.1 - Bug fixes"
   git push
   ```

3. Build and submit:
   ```bash
   npm run build:ios:production
   npm run submit:ios
   ```

## Testing Locally with Xcode

To open your app in Xcode:

```bash
# Generate native iOS project
npm run prebuild:ios

# Open in Xcode
open ios/stargaze.xcworkspace
```

From Xcode, you can:
- Run on simulators
- Run on physical devices
- Debug native code
- Test permissions
- Profile performance

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Apple TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

## Quick Reference Commands

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Setup credentials
eas credentials

# Build for simulator
npm run build:ios:simulator

# Build for TestFlight
npm run build:ios:production

# Submit to App Store Connect
npm run submit:ios

# Generate Xcode project
npm run prebuild:ios

# Check build status
eas build:list
```

## Next Steps

1. ✅ Complete Apple Developer enrollment
2. ✅ Create app in App Store Connect
3. ✅ Install EAS CLI: `npm install -g eas-cli`
4. ✅ Login to EAS: `eas login`
5. ✅ Configure project: `eas build:configure`
6. ✅ Setup credentials: `eas credentials`
7. ✅ Create app icons (see ASSETS_GUIDE.md)
8. ✅ Build: `npm run build:ios:production`
9. ✅ Submit: `npm run submit:ios`
10. ✅ Configure TestFlight testers in App Store Connect

## Support

If you encounter issues:
- Check [Expo Forums](https://forums.expo.dev/)
- Review [EAS Build Troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)
- Check [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

**Good luck with your TestFlight deployment! 🚀**

