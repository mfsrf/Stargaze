// MessagesScreen - battle reports, notifications, and fleet tracking

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import { formatNumber, formatDuration } from "../utils/gameFormulas";
import { SHIP_NAMES } from "../utils/gameConstants";

export default function MessagesScreen() {
  const theme = useThemeStore((state) => state.theme);
  const messages = useGameStore((state) => state.player.messages);
  const fleets = useGameStore((state) => state.player.fleets);
  const markMessageAsRead = useGameStore((state) => state.markMessageAsRead);
  const deleteMessage = useGameStore((state) => state.deleteMessage);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedTab, setSelectedTab] = useState<"messages" | "fleets">("fleets");
  
  // Update current time every second for fleet timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleTabChange = (tab: "messages" | "fleets") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };
  
  const handleMessagePress = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markMessageAsRead(messageId);
  };
  
  const handleDeleteMessage = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteMessage(messageId);
  };
  
  const getMessageIcon = (type: string) => {
    switch (type) {
      case "combat": return "flash";
      case "espionage": return "eye";
      case "fleet": return "rocket";
      default: return "mail";
    }
  };
  
  const getMessageColor = (type: string) => {
    switch (type) {
      case "combat": return theme.colors.danger;
      case "espionage": return theme.colors.warning;
      case "fleet": return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };
  
  const unreadCount = messages.filter((m) => !m.read).length;
  const activeFleets = fleets.filter((f) => 
    f.arrivalTime > currentTime || (f.returnTime && f.returnTime > currentTime)
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      {/* Header with Tabs */}
      <View style={{ 
        backgroundColor: theme.colors.card, 
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: 24, 
          fontWeight: "bold", 
          paddingHorizontal: 16,
          marginBottom: 16,
        }}>
          Communications
        </Text>
        
        <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => handleTabChange("fleets")}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: selectedTab === "fleets" ? theme.colors.primary : "transparent",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons 
                name="rocket" 
                size={18} 
                color={selectedTab === "fleets" ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={{ 
                color: selectedTab === "fleets" ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 15,
                fontWeight: "600",
                marginLeft: 6,
              }}>
                Fleets
              </Text>
              {activeFleets.length > 0 && (
                <View style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: 6,
                }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                    {activeFleets.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabChange("messages")}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: selectedTab === "messages" ? theme.colors.primary : "transparent",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons 
                name="mail" 
                size={18} 
                color={selectedTab === "messages" ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={{ 
                color: selectedTab === "messages" ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 15,
                fontWeight: "600",
                marginLeft: 6,
              }}>
                Messages
              </Text>
              {unreadCount > 0 && (
                <View style={{
                  backgroundColor: theme.colors.danger,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: 6,
                }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {selectedTab === "fleets" ? (
          /* Fleet Tracking Tab */
          activeFleets.length === 0 ? (
            <View style={{ 
              flex: 1, 
              alignItems: "center", 
              justifyContent: "center", 
              paddingVertical: 60,
            }}>
              <Ionicons name="rocket-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: 18, 
                fontWeight: "600", 
                marginTop: 16,
              }}>
                No Active Fleets
              </Text>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: 14, 
                textAlign: "center",
                marginTop: 8,
              }}>
                Send fleets from the Galaxy screen to see them here
              </Text>
            </View>
          ) : (
            activeFleets.map((fleet) => {
              const isReturning = fleet.isReturning;
              const timeLeft = isReturning && fleet.returnTime 
                ? fleet.returnTime - currentTime 
                : fleet.arrivalTime - currentTime;
              const progress = isReturning && fleet.returnTime
                ? ((currentTime - fleet.arrivalTime) / (fleet.returnTime - fleet.arrivalTime)) * 100
                : ((currentTime - fleet.departureTime) / (fleet.arrivalTime - fleet.departureTime)) * 100;
              
              const shipCount = Object.values(fleet.ships).reduce((sum, count) => sum + count, 0);
              const mainShipType = Object.entries(fleet.ships)
                .filter(([_, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)[0];
              
              return (
                <View
                  key={fleet.id}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: isReturning ? theme.colors.success + "40" : theme.colors.primary + "40",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isReturning ? theme.colors.success + "20" : theme.colors.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}>
                      <Ionicons 
                        name={isReturning ? "arrow-back" : "rocket"} 
                        size={24} 
                        color={isReturning ? theme.colors.success : theme.colors.primary} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700" }}>
                        {isReturning ? "Returning Fleet" : fleet.mission.charAt(0).toUpperCase() + fleet.mission.slice(1)} Mission
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                        {shipCount} ships • {mainShipType ? SHIP_NAMES[mainShipType[0] as keyof typeof SHIP_NAMES] : "Mixed"}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ 
                        color: isReturning ? theme.colors.success : theme.colors.primary, 
                        fontSize: 14, 
                        fontWeight: "700",
                      }}>
                        {formatDuration(Math.max(0, timeLeft / 1000))}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                        {isReturning ? "until return" : "until arrival"}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={{
                    height: 6,
                    backgroundColor: theme.colors.border,
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}>
                    <View style={{
                      height: "100%",
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                      backgroundColor: isReturning ? theme.colors.success : theme.colors.primary,
                    }} />
                  </View>
                  
                  {/* Route Info */}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginBottom: 2 }}>
                        From
                      </Text>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
                        [{fleet.origin.galaxy}:{fleet.origin.system}:{fleet.origin.position}]
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginBottom: 2 }}>
                        To
                      </Text>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
                        [{fleet.destination.galaxy}:{fleet.destination.system}:{fleet.destination.position}]
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )
        ) : (
          /* Messages Tab */
          messages.length === 0 ? (
            <View style={{ 
              flex: 1, 
              alignItems: "center", 
              justifyContent: "center", 
              paddingVertical: 60,
            }}>
              <Ionicons name="mail-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: 18, 
                fontWeight: "600", 
                marginTop: 16,
              }}>
                No Messages
              </Text>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: 14, 
                textAlign: "center",
                marginTop: 8,
              }}>
                Combat reports and notifications will appear here
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                onPress={() => handleMessagePress(message.id)}
                onLongPress={() => handleDeleteMessage(message.id)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: message.read ? theme.colors.card : theme.colors.primary + "10",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: message.read ? theme.colors.border : theme.colors.primary + "40",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getMessageColor(message.type) + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}>
                    <Ionicons 
                      name={getMessageIcon(message.type) as keyof typeof Ionicons.glyphMap} 
                      size={20} 
                      color={getMessageColor(message.type)} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: 15, 
                        fontWeight: message.read ? "600" : "700",
                        flex: 1,
                      }}>
                        {message.title}
                      </Text>
                      {!message.read && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.colors.primary,
                        }} />
                      )}
                    </View>
                    <Text style={{ 
                      color: theme.colors.textSecondary, 
                      fontSize: 13, 
                      lineHeight: 18,
                      marginBottom: 6,
                    }}>
                      {message.content}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
