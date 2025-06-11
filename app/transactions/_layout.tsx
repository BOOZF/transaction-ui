import { Stack } from "expo-router";
import React from "react";
import { TransactionProvider } from "../../components/transactions/transactionContext";

export default function TabLayout() {
  return (
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
  );
}
