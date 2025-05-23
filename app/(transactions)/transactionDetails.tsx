"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  Flag,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { useTransactionDetails } from "./_components/hooks";
import TransactionDetailsItems from "./_components/transactionDetailsItems";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    transaction,
    isLoading,
    amountVisible,
    handleRevealAmount,
    handleHideAmount,
  } = useTransactionDetails(id);

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
            {!amountVisible ? (
              <TouchableOpacity
                onPress={handleRevealAmount}
                className="flex-row items-center bg-[#E3F2FD] px-3 py-1.5 rounded-2xl ml-3"
              >
                <Eye size={20} color="#0047CC" />
                <Text className="text-sm font-semibold text-[#0047CC] ml-1">
                  Reveal
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleHideAmount}
                className="flex-row items-center bg-[#FFF3E0] px-3 py-1.5 rounded-2xl ml-3"
              >
                <EyeOff size={20} color="#FF9800" />
                <Text className="text-sm font-semibold text-[#FF9800] ml-1">
                  Hide
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {amountVisible && (
            <Text className="text-xs text-[#666666] mt-2">
              Amount will be hidden automatically after 5 minutes
            </Text>
          )}
        </View>

        <View className="h-px bg-[#E5E5E5] my-4" />

        <View className="mb-2">
          <TransactionDetailsItems
            label="Transaction ID"
            value={transaction.id}
          />
          <TransactionDetailsItems
            label="Description"
            value={transaction.description}
          />
          <TransactionDetailsItems
            label="Category"
            value={transaction.category}
          />
          <TransactionDetailsItems label="Status" value={transaction.status} />
          {transaction.reference && (
            <TransactionDetailsItems
              label="Reference"
              value={transaction.reference}
            />
          )}
        </View>

        {transaction.merchant && (
          <>
            <View className="h-px bg-[#E5E5E5] my-4" />
            <View className="mb-2">
              <Text className="text-base font-semibold text-[#1A1A1A] mb-3">
                Merchant Details
              </Text>
              <TransactionDetailsItems
                label="Name"
                value={transaction.merchant.name}
              />
              {transaction.merchant.location && (
                <TransactionDetailsItems
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
