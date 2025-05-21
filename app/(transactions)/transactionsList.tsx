"use client";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  LogOut,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./_components/hooks/authContext";
import { useTransactions } from "./_components/hooks/transactionContext";
import TransactionItem from "./_components/transactionsItems";

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, isLoading, error, fetchTransactions } =
    useTransactions();
  const { isAuthenticated, logout } = useAuth();
  const [amountsVisible, setAmountsVisible] = useState(false);

  // Separate states for initial loading and refresh loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track if this is first load
  const isFirstLoad = useRef(true);

  // Load data initially or in background
  const loadData = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setInitialLoading(true);
      }

      try {
        await fetchTransactions();
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [fetchTransactions]
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    // Only show loading indicator on first app load
    if (isFirstLoad.current) {
      loadData(true);
      isFirstLoad.current = false;
    } else {
      // Silent background refresh for subsequent loads
      loadData(false);
    }

    // Set up periodic background refresh - every 30 seconds
    const refreshInterval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [loadData]);

  const handleTransactionPress = (id: string) => {
    router.push({
      pathname: "/(transactions)/transactionDetails",
      params: { id },
    });
  };

  const toggleAmountsVisibility = async () => {
    try {
      // Attempt authentication with better error handling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use Face ID to reveal transaction amounts",
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        setAmountsVisible(!amountsVisible);
      } else if (result.error === "user_cancel") {
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

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0047CC" />
        <Text className="mt-4 text-base text-[#666666]">
          Loading transactions...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <AlertCircle size={48} color="#FF3B30" />
        <Text className="mt-4 text-base text-[#1A1A1A]">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-[#0047CC] py-3 px-6 rounded-lg"
          onPress={() => loadData(true)}
        >
          <Text className="text-base font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA]">
        <View className="flex-row justify-between items-center px-4 py-5">
          <Text className="text-2xl font-bold text-[#1A1A1A]">
            Transactions
          </Text>
          <TouchableOpacity onPress={handleLogout} className="p-1">
            <LogOut size={24} color="#0047CC" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <FileText size={48} color="#999" />
          <Text className="mt-4 text-lg font-semibold text-[#1A1A1A]">
            No transactions found
          </Text>
          <Text className="mt-2 text-sm text-[#666666] text-center">
            Your transactions will appear here once they are processed
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-row justify-between items-center px-4 py-5">
        <Text className="text-2xl font-bold text-[#1A1A1A]">Transactions</Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleAmountsVisibility} className="mr-4">
            {amountsVisible ? (
              <Eye size={24} color="#0047CC" />
            ) : (
              <EyeOff size={24} color="#0047CC" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} className="p-1">
            <LogOut size={24} color="#0047CC" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => handleTransactionPress(item.id)}
            amountsVisible={amountsVisible}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0047CC"]}
            tintColor="#0047CC"
          />
        }
      />
    </SafeAreaView>
  );
}
