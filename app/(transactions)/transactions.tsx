"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionItem from "./components/transactionsItems";
import { useAuth } from "./context/authContext";
import { useTransactions } from "./context/transactionContext";

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

  const toggleAmountsVisibility = () => {
    setAmountsVisible(!amountsVisible);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0047CC" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadData(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#0047CC" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="document-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySubtext}>
            Your transactions will appear here once they are processed
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={toggleAmountsVisibility}
            style={styles.visibilityButton}
          >
            <Ionicons
              name={amountsVisible ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#0047CC"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#0047CC" />
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
        contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  visibilityButton: {
    marginRight: 16,
  },
  logoutButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#0047CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
