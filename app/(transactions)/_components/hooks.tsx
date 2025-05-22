import { useAuth } from "@/components/auth/authContext";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTransactions } from "../../../components/transactions/transactionContext";

// BIOMETRIC TIMEOUT CONSTANT
const VISIBILITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

// TRANSACTION DETAILS FUNCTIONS
export function useTransactionDetails(id: string | undefined) {
  const router = useRouter();
  const { getTransactionById } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amountVisible, setAmountVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Effect to handle the visibility timer
  useEffect(() => {
    // If amount becomes visible, start the timer
    if (amountVisible) {
      // Clear any existing timer first
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer to hide the amount after the timeout period
      timerRef.current = setTimeout(() => {
        setAmountVisible(false);
      }, VISIBILITY_TIMEOUT);
    } else {
      // If amount becomes invisible, clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [amountVisible]);

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

  const handleHideAmount = () => {
    // No authentication needed to hide the amount
    setAmountVisible(false);
  };

  return {
    transaction,
    isLoading,
    amountVisible,
    handleRevealAmount,
    handleHideAmount,
  };
}

// TRANSACTION LIST FUNCTIONS
export function useTransactionList() {
  const router = useRouter();
  const { transactions, isLoading, error, fetchTransactions } =
    useTransactions();
  const { logout } = useAuth();
  const [amountsVisible, setAmountsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Separate states for initial loading and refresh loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track if this is first load
  const isFirstLoad = useRef(true);

  // Effect to handle the visibility timer
  useEffect(() => {
    // If amounts become visible, start the timer
    if (amountsVisible) {
      // Clear any existing timer first
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer to hide the amounts after the timeout period
      timerRef.current = setTimeout(() => {
        setAmountsVisible(false);
      }, VISIBILITY_TIMEOUT);
    } else {
      // If amounts become invisible, clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [amountsVisible]);

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

  const showAmounts = async () => {
    try {
      // Attempt authentication with better error handling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use Face ID to reveal transaction amounts",
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        setAmountsVisible(true);
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

  const hideAmounts = () => {
    // No authentication needed to hide the amounts
    setAmountsVisible(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return {
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
  };
}
