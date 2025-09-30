// components/AdminFooter.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode?: boolean;
};

export default function AdminFooter({ activeTab, setActiveTab, darkMode }: Props) {
  return (
    <View style={[styles.footer, darkMode && { backgroundColor: "#222" }]}>
      {["Dashboard", "Users", "Reports", "Settings"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={styles.footerButton}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.footerText,
              activeTab === tab && { color: darkMode ? "#FFA500" : "#4CAF50" },
              darkMode && { color: "#fff" },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});
