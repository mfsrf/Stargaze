# Space Empire - OGame-inspired Strategy Game

## 🎮 Game Overview
A single-player space strategy game inspired by OGame, featuring resource management, building upgrades, fleet construction, and AI opponents. Built with React Native and Expo for iOS.

## ✨ Features

### Core Gameplay
- **Resource Management**: Mine metal, crystal, and deuterium with automatic production
- **Building System**: 14 different buildings with exponential leveling
- **Dark Mode**: Beautiful dark theme with vibrant gradient UI elements
- **Planet Management**: Unlimited colonization with multiple planets
- **Fast-Paced**: 10x resource production speed (adjustable 1x-50x)
- **No Premium Currency**: All features available without paywalls

### UI/UX Features
- **Touch-Optimized**: All buttons use TouchableOpacity for reliable touch responses
- **Visual Gradients**: Each building type has unique color gradients and icons
- **Haptic Feedback**: Tactile responses on all interactions
- **Real-Time Updates**: Resources update every second
- **Progress Tracking**: Animated progress bars for construction
- **Persistent State**: Game saves automatically with AsyncStorage

### Building Types

#### Resource Production
- **Metal Mine** 🔨 - Brown/bronze gradient
- **Crystal Mine** 💎 - Blue gradient
- **Deuterium Synthesizer** 💧 - Green gradient
- **Solar Plant** ☀️ - Yellow/gold gradient
- **Fusion Reactor** ☢️ - Red gradient

#### Storage
- **Metal Storage** 📦 - Gray gradient
- **Crystal Storage** 💜 - Purple gradient
- **Deuterium Tank** 🧪 - Teal gradient

#### Facilities
- **Robotics Factory** 🏗️ - Orange gradient
- **Shipyard** 🚀 - Purple gradient
- **Research Lab** 🔬 - Light blue gradient
- **Nanite Factory** 🔧 - Pink/purple gradient
- **Terraformer** 🌍 - Green gradient

## 🎨 Design System

### Dark Mode Theme
- Background: Pure black (#000000) for OLED
- Cards: Dark gray (#1c1c1e)
- Primary: iOS blue (#0A84FF)
- Resource Colors:
  - Metal: Bronze (#A0826D)
  - Crystal: Blue (#64B5F6)
  - Deuterium: Green (#66BB6A)
  - Energy: Gold (#FFD54F)

### Visual Enhancements
- **Linear Gradients**: Building icons and upgrade buttons
- **Shadows**: Depth and elevation for touch targets
- **Color Coding**: Unique colors per building type
- **Active Badges**: Visual indicator for operational buildings
- **Animated Progress**: Smooth construction progress bars

## 🚀 Getting Started

### New Game Setup
1. Enter your empire name
2. Select starting galaxy (1-5)
3. Choose AI opponent count:
   - 3 opponents: Easy
   - 4 opponents: Medium
   - 5 opponents: Hard

### Gameplay Loop
1. **Start with basic resources**: 500 metal, 300 crystal, 100 deuterium
2. **Upgrade Metal Mine** for steady income
3. **Build Solar Plants** for energy
4. **Expand storage** as production grows
5. **Unlock facilities** (Robotics Factory → Shipyard → Research Lab)
6. **Research technologies** (coming soon)
7. **Build fleets** (coming soon)
8. **Colonize planets** (coming soon)

## 🔧 Technical Implementation

### State Management
- **Zustand**: Global state with AsyncStorage persistence
- **Separate Stores**: Theme store and game store
- **Optimized Updates**: Only persists necessary data

### Navigation
- **Bottom Tabs**: 5 main sections (Planet, Galaxy, Messages, Stats, Settings)
- **Material Top Tabs**: Within Planet screen (Buildings, Research, Shipyard, Fleet)
- **Conditional Navigation**: New Game screen vs Main game flow

### Performance
- **Real-time Updates**: Resource accumulation every second
- **Offline Support**: Calculates missed production on app resume
- **Optimized Rendering**: Individual selectors to prevent unnecessary re-renders

## 📱 Screens

### Planet Screen (Main)
- **Buildings Tab**: Fully functional with all 14 buildings ✅
- **Research Tab**: Coming soon
- **Shipyard Tab**: Coming soon
- **Fleet Tab**: Coming soon

### Other Screens
- **Galaxy**: Explore and colonize (coming soon)
- **Messages**: Combat reports and notifications (coming soon)
- **Stats**: Rankings and achievements (coming soon)
- **Settings**: Dark mode toggle, resource speed, reset game ✅

## 🎯 Completed Features
- ✅ Game state management with persistence
- ✅ Complete type system
- ✅ All 14 building types with costs and formulas
- ✅ Resource production and energy system
- ✅ Building upgrade system with construction queues
- ✅ Dark mode with theme persistence
- ✅ Touch-optimized UI with TouchableOpacity
- ✅ Beautiful gradient visuals for buildings
- ✅ Real-time resource updates
- ✅ New game initialization
- ✅ Settings screen with adjustable gameplay

## 🚧 In Development
- Fleet construction and combat system
- AI opponent logic
- Galaxy exploration and colonization
- Research technology tree UI
- Battle reports and messaging
- Statistics and rankings

## 🐛 Recent Fixes
- **Touch Responsiveness**: Replaced Pressable with TouchableOpacity for better touch handling
- **Visual Enhancement**: Added unique color gradients for each building type
- **Button Clarity**: Improved upgrade button visibility with gradients
- **Icon Design**: Larger, more visible building icons with shadows

## 🎮 Controls
- **Tap building card**: View details and costs
- **Tap "Upgrade" button**: Start construction (if resources available)
- **Swipe tabs**: Navigate between Buildings/Research/Shipyard/Fleet
- **Tap planet**: Switch between your planets
- **Toggle settings**: Adjust game speed and theme

## 💡 Tips
- **Energy is critical**: Upgrade Solar Plants to keep mines running at full capacity
- **Storage matters**: Upgrade storage buildings or resources will cap
- **Build Robotics Factory early**: Reduces construction time significantly
- **Balance resources**: Don't over-invest in one resource type
- **Plan ahead**: Check prerequisites before starting upgrades

## 🌟 Future Enhancements
- Research system with technology tree
- Fleet battles with AI opponents
- Espionage and reconnaissance
- Multiple planet management
- Combat reports with detailed breakdowns
- Alliance/diplomacy features
- Expeditions for rare resources
- Moon creation from debris fields

---

Built with ❤️ using React Native, Expo, and TypeScript
