import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import useGameStore from "./src/state/gameStore";
import useThemeStore from "./src/state/themeStore";
import NewGameScreen from "./src/screens/NewGameScreen";
import PlanetScreen from "./src/screens/PlanetScreen";
import GalaxyScreen from "./src/screens/GalaxyScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import StatsScreen from "./src/screens/StatsScreen";
import MissionsScreen from "./src/screens/MissionsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const theme = useThemeStore((state) => state.theme);
  const missions = useGameStore((state) => state.player.missions || []);
  const messages = useGameStore((state) => state.player.messages || []);
  const planets = useGameStore((state) => state.player.planets);
  
  // Count ready missions
  const readyMissionsCount = missions.filter((mission) => {
    if (mission.status !== "available") return false;
    
    // Check if all requirements are met
    return mission.requirements.every((req) => {
      if (req.type === "buildingLevel" && req.buildingType) {
        return planets.some(
          (planet) => planet.buildings[req.buildingType!] >= (req.level || 1)
        );
      }
      return false;
    });
  }).length;
  
  // Count unread messages
  const unreadMessagesCount = messages.filter((msg) => !msg.read).length;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          
          if (route.name === "Planet") {
            iconName = focused ? "planet" : "planet-outline";
          } else if (route.name === "Galaxy") {
            iconName = focused ? "globe" : "globe-outline";
          } else if (route.name === "Messages") {
            iconName = focused ? "mail" : "mail-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Missions") {
            iconName = focused ? "flag" : "flag-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Planet" component={PlanetScreen} />
      <Tab.Screen name="Galaxy" component={GalaxyScreen} />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }}
      />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen 
        name="Missions" 
        component={MissionsScreen}
        options={{
          tabBarBadge: readyMissionsCount > 0 ? readyMissionsCount : undefined,
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const initialized = useGameStore((state) => state.initialized);
  const theme = useThemeStore((state) => state.theme);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: theme.dark,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.card,
              text: theme.colors.text,
              border: theme.colors.border,
              notification: theme.colors.danger,
            },
            fonts: {
              regular: {
                fontFamily: "System",
                fontWeight: "400",
              },
              medium: {
                fontFamily: "System",
                fontWeight: "500",
              },
              bold: {
                fontFamily: "System",
                fontWeight: "700",
              },
              heavy: {
                fontFamily: "System",
                fontWeight: "900",
              },
            },
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!initialized ? (
              <Stack.Screen name="NewGame" component={NewGameScreen} />
            ) : (
              <Stack.Screen name="Main" component={MainTabs} />
            )}
          </Stack.Navigator>
          <StatusBar style={theme.dark ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
