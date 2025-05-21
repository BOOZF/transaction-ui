"use client";

import * as LocalAuthentication from "expo-local-authentication";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  Flag,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { useTransactions } from "./_components/hooks/transactionContext";

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
      <View className="flex-1 justify-center items-center bg-[#F5F7FA]">
        <ActivityIndicator size="large" color="#0047CC" />
        <Text className="mt-3 text-base text-[#666666]">
          Loading transaction details...
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7FA] p-6">
        <AlertCircle size={48} color="#FF3B30" />
        <Text className="mt-3 text-lg text-[#1A1A1A]">
          Transaction not found
        </Text>
        <TouchableOpacity
          className="mt-6 bg-[#0047CC] py-3 px-6 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-base font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F5F7FA]"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="flex-row items-center justify-between py-4 mb-2 mt-10">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#0047CC" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#1A1A1A]">
          Transaction Details
        </Text>
        <View className="w-6" />
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View
            className={`flex-row items-center px-3 py-1.5 rounded-2xl ${
              transaction.type === "credit" ? "bg-[#E3F2FD]" : "bg-[#FFF3E0]"
            }`}
          >
            {transaction.type === "credit" ? (
              <ArrowDown size={16} color="#0047CC" />
            ) : (
              <ArrowUp size={16} color="#FF9800" />
            )}
            <Text
              className={`text-sm font-semibold ml-1 ${
                transaction.type === "credit"
                  ? "text-[#0047CC]"
                  : "text-[#FF9800]"
              }`}
            >
              {transaction.type === "credit" ? "Received" : "Sent"}
            </Text>
          </View>
          <Text className="text-sm text-[#666666]">
            {formatDate(transaction.date)} at {formatTime(transaction.date)}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm text-[#666666] mb-1">Amount</Text>
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold text-[#1A1A1A]">
              {amountVisible ? formatCurrency(transaction.amount) : "••••••••"}
            </Text>
            {!amountVisible && (
              <TouchableOpacity
                onPress={handleRevealAmount}
                className="flex-row items-center bg-[#E3F2FD] px-3 py-1.5 rounded-2xl ml-3"
              >
                <Eye size={20} color="#0047CC" />
                <Text className="text-sm font-semibold text-[#0047CC] ml-1">
                  Reveal
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="h-px bg-[#E5E5E5] my-4" />

        <View className="mb-2">
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
            <View className="h-px bg-[#E5E5E5] my-4" />
            <View className="mb-2">
              <Text className="text-base font-semibold text-[#1A1A1A] mb-3">
                Merchant Details
              </Text>
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

      <TouchableOpacity className="flex-row items-center justify-center bg-white py-4 rounded-xl mb-6">
        <Flag size={20} color="#FF3B30" />
        <Text className="text-base font-semibold text-[#FF3B30] ml-2">
          Report an Issue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-sm text-[#666666]">{label}</Text>
    <Text className="text-sm text-[#1A1A1A] font-medium max-w-[60%] text-right">
      {value}
    </Text>
  </View>
);
