import { Stack } from "expo-router";
import React from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "./_components/hooks/authContext";
import { TransactionProvider } from "./_components/hooks/transactionContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <TransactionProvider>
        <Stack>
          <Stack.Screen
            name="transactions"
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
