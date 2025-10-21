# iOS App Icons and Assets Guide for Stargaze

## Required Assets

To publish your app to TestFlight and the App Store, you'll need the following assets in the `/assets` directory:

### 1. App Icon (`icon.png`)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Purpose:** Used for the app icon on iOS devices
- **Requirements:**
  - No transparency
  - Square shape
  - High resolution
  - No rounded corners (iOS adds them automatically)

### 2. Splash Screen (`splash.png`)
- **Size:** 1242x2436 pixels (or larger)
- **Format:** PNG
- **Purpose:** Shown when the app launches
- **Requirements:**
  - Can have transparency
  - Should match your app's branding
  - Simple design works best

## Current Status

Currently, you have:
- ✅ `metal-icon.png` (existing asset)
- ⚠️ Need to create: `icon.png` (1024x1024)
- ⚠️ Need to create: `splash.png` (1242x2436)

## Quick Setup Options

### Option 1: Use Existing Asset
If `metal-icon.png` is suitable:
```bash
# Copy and resize to create app icon (requires ImageMagick)
convert assets/metal-icon.png -resize 1024x1024 assets/icon.png
```

### Option 2: Create Custom Assets
1. Use a design tool (Figma, Sketch, Photoshop)
2. Design your icon at 1024x1024
3. Design your splash screen at 1242x2436
4. Export as PNG files
5. Place in `/assets` folder

### Option 3: Use Expo's Icon Generator
```bash
npx expo-icon-generator assets/your-source-image.png
```

## Testing Your Assets

After adding your assets, run:
```bash
expo prebuild --platform ios --clean
```

This will generate the iOS project with your icons properly configured.

## Notes

- iOS automatically generates all required icon sizes from your 1024x1024 icon
- The splash screen can be simple - many apps use a solid color with a logo
- Make sure your icon looks good at small sizes (it will be displayed at various sizes)

