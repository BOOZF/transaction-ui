"use client";

import { AuthProvider } from "./(transactions)/_components/authContext";
import AuthScreen from "./(transactions)/auth";
// Wrap the component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
}
