// components/AdminFooter.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode?: boolean;
};

export default function AdminFooter({ activeTab, setActiveTab, darkMode }: Props) {
  const tabs = ["Dashboard", "Users", "Reports", "Settings"];

  return (
    <View style={[styles.footer, darkMode ? styles.darkFooter : null]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        let textColor = "#000"; // default light mode inactive
        if (darkMode) textColor = "#fff"; // dark mode all white
        else if (isActive) textColor = "#4CAF50"; // light mode active green

        return (
          <TouchableOpacity
            key={tab}
            style={styles.footerButton}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.footerText, { color: textColor }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  darkFooter: {
    backgroundColor: "#222",
    borderTopColor: "#444",
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
