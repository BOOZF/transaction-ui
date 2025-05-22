"use client";

import { Fingerprint, Scan } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import hook
import { useAuthFunctions } from "@/app/lib/useAuth";

export default function AuthScreen() {
  const {
    biometricType,
    biometricAuthMutation,
    handleBiometricAuth,
    getAuthButtonText,
    getAuthIcon,
  } = useAuthFunctions();

  // Get the appropriate auth button text
  const authButtonText = getAuthButtonText();

  // Get appropriate icon component
  const authIconType = getAuthIcon();

  // Render the appropriate icon
  const renderIcon = () => {
    if (authIconType === "facial") {
      return <Scan size={24} color="#FFFFFF" />;
    }
    return <Fingerprint size={24} color="#FFFFFF" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="items-center mt-15">
        <Image
          source={{ uri: "https://placeholder.svg?height=100&width=100" }}
          className="w-25 h-25 rounded-[20px]"
        />
        <Text className="text-2xl font-bold text-[#0047CC] mt-4">Ryt Bank</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-semibold text-[#1A1A1A] mb-3">
          Welcome back
        </Text>
        <Text className="text-base text-[#666666] text-center mb-10">
          Please authenticate using{" "}
          {biometricType === "facial"
            ? "Face ID"
            : biometricType === "fingerprint"
            ? Platform.OS === "ios"
              ? "Touch ID"
              : "your fingerprint"
            : "biometrics"}{" "}
          to access your transaction history
        </Text>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#0047CC] py-4 px-6 rounded-xl w-full max-w-[300px]"
          onPress={handleBiometricAuth}
          disabled={biometricAuthMutation.isPending || !biometricType}
        >
          {biometricAuthMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {renderIcon()}
              <Text className="text-white text-base font-semibold ml-2">
                {authButtonText}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View className="p-6 items-center">
        <Text className="text-[#666666] text-sm">
          Secure Banking • Trusted Service
        </Text>
      </View>
    </SafeAreaView>
  );
}
