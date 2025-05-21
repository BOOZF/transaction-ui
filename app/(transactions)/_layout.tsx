import { Stack } from "expo-router";
import React from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "./_components/authContext";
import { TransactionProvider } from "./_components/transactionContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <TransactionProvider>
        <Stack>
          <Stack.Screen
            name="auth"
            options={{
              title: "Auth",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="transactionsList"
            options={{
              title: "Transactions",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="transactionDetails"
            options={{
              title: "Transaction Details",
              headerShown: false,
            }}
          />
        </Stack>
      </TransactionProvider>
    </AuthProvider>
  );
}
