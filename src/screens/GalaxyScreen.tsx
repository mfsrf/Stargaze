// GalaxyScreen - explore and interact with the universe

import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "../state/themeStore";

export default function GalaxyScreen() {
  const theme = useThemeStore((state) => state.theme);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
          Galaxy View
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: "center" }}>
          Explore the galaxy, find new planets to colonize, and scout enemy positions.
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 20 }}>
          Coming soon in the next update!
        </Text>
      </View>
    </SafeAreaView>
  );
}
