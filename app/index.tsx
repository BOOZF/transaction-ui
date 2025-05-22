"use client";

import { AuthProvider } from "@/components/auth/authContext";
import AuthScreen from "./auth";
// Wrap the component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
}
