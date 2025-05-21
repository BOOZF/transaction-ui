"use client";

import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { useTransactions } from "./context/transactionContext";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransactionById } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amountVisible, setAmountVisible] = useState(false);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setIsLoading(true);
        if (!id) {
          Alert.alert("Error", "Transaction ID is missing");
          router.back();
          return;
        }

        const foundTransaction = getTransactionById(id);
        if (foundTransaction) {
          setTransaction(foundTransaction);
        } else {
          Alert.alert("Error", "Transaction not found");
          router.back();
        }
      } catch (error) {
        console.error("Error loading transaction:", error);
        Alert.alert("Error", "Failed to load transaction details");
      } finally {
        setIsLoading(false);
      }
    };

    loadTransaction();
  }, [id, getTransactionById, router]);

  const handleRevealAmount = async () => {
    try {
      // Attempt authentication with better error handling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use Face ID to reveal transaction amount",
        // Allow passcode fallback for better user experience
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        setAmountVisible(true);
      } else if (result.error === "user_cancel") {
        // User canceled, do nothing specific here
        console.log("User canceled authentication");
      } else if (result.error === "lockout") {
        Alert.alert(
          "Face ID Temporarily Disabled",
          "Too many failed attempts. Please try again later or use your device passcode."
        );
      } else {
        Alert.alert(
          "Authentication Failed",
          "Please make sure your face is clearly visible to the camera and try again."
        );
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Authentication Error",
        "There was a problem with Face ID. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0047CC" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonSmall}
        >
          <Ionicons name="arrow-back" size={24} color="#0047CC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.typeIndicator,
              {
                backgroundColor:
                  transaction.type === "credit" ? "#E3F2FD" : "#FFF3E0",
              },
            ]}
          >
            <Ionicons
              name={transaction.type === "credit" ? "arrow-down" : "arrow-up"}
              size={16}
              color={transaction.type === "credit" ? "#0047CC" : "#FF9800"}
            />
            <Text
              style={[
                styles.typeText,
                {
                  color: transaction.type === "credit" ? "#0047CC" : "#FF9800",
                },
              ]}
            >
              {transaction.type === "credit" ? "Received" : "Sent"}
            </Text>
          </View>
          <Text style={styles.date}>
            {formatDate(transaction.date)} at {formatTime(transaction.date)}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>
              {amountVisible ? formatCurrency(transaction.amount) : "••••••••"}
            </Text>
            {!amountVisible && (
              <TouchableOpacity
                onPress={handleRevealAmount}
                style={styles.revealButton}
              >
                <Ionicons name="eye-outline" size={20} color="#0047CC" />
                <Text style={styles.revealText}>Reveal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <DetailRow label="Transaction ID" value={transaction.id} />
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow label="Category" value={transaction.category} />
          <DetailRow label="Status" value={transaction.status} />
          {transaction.reference && (
            <DetailRow label="Reference" value={transaction.reference} />
          )}
        </View>

        {transaction.merchant && (
          <>
            <View style={styles.divider} />
            <View style={styles.merchantContainer}>
              <Text style={styles.sectionTitle}>Merchant Details</Text>
              <DetailRow label="Name" value={transaction.merchant.name} />
              {transaction.merchant.location && (
                <DetailRow
                  label="Location"
                  value={transaction.merchant.location}
                />
              )}
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.reportButton}>
        <Ionicons name="flag-outline" size={20} color="#FF3B30" />
        <Text style={styles.reportButtonText}>Report an Issue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    padding: 16,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  backButtonSmall: {
    padding: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  date: {
    fontSize: 14,
    color: "#666666",
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  revealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  revealText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0047CC",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  merchantContainer: {
    marginBottom: 8,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#1A1A1A",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#0047CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
