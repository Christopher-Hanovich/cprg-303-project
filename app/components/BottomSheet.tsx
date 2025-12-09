import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type BottomSheetProps = {
  visible: boolean;
  title?: string;
  address?: string;
  bottomInset: number;
  onClose: () => void;
  onGetDirections?: () => void;
};

export default function BottomSheet({ visible, title, address, bottomInset, onClose, onGetDirections }: BottomSheetProps) {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { paddingBottom: bottomInset }]}>
      <View style={styles.sheet}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.address}>{address}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={onGetDirections}>
          <Text style={styles.actionButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
    minHeight: 150,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingRight: 30,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

