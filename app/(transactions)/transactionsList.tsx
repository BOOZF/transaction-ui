"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  LogOut,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactionList } from "./_components/hooks";
import TransactionItems from "./_components/transactionItems";

export default function TransactionsScreen() {
  const {
    transactions,
    error,
    initialLoading,
    refreshing,
    amountsVisible,
    loadData,
    handleRefresh,
    handleTransactionPress,
    showAmounts,
    hideAmounts,
    handleLogout,
  } = useTransactionList();

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
          {!amountsVisible ? (
            <TouchableOpacity onPress={showAmounts} className="mr-4">
              <EyeOff size={24} color="#0047CC" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={hideAmounts} className="mr-4">
              <Eye size={24} color="#0047CC" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout} className="p-1">
            <LogOut size={24} color="#0047CC" />
          </TouchableOpacity>
        </View>
      </View>

      {amountsVisible && (
        <View className="px-4 pb-2">
          <Text className="text-xs text-[#666666]">
            Amounts will be hidden automatically after 2 minutes
          </Text>
        </View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItems
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
