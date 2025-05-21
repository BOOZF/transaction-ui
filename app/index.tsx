"use client";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { Fingerprint, Scan } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import AuthContext
import {
  AuthProvider,
  useAuth,
} from "./(transactions)/_components/hooks/authContext";

// Wrap the component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
}

function AuthScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // Check if hardware supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        setBiometricType(null);
        return;
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setBiometricType(null);
        return;
      }

      // Get available biometric types
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType("facial");
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        setBiometricType("fingerprint");
      } else {
        setBiometricType("biometric");
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setBiometricType(null);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsLoading(true);

      // Check if we have permission to use local authentication
      const permission = await LocalAuthentication.hasHardwareAsync();
      if (!permission) {
        Alert.alert(
          "Error",
          "This device does not support biometric authentication"
        );
        setIsLoading(false);
        return;
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          "Biometrics Not Set Up",
          "Please set up Face ID in your device settings to use this feature"
        );
        setIsLoading(false);
        return;
      }

      // Attempt biometric authentication with user-friendly options
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use Face ID to access your transactions",
        // Allow passcode fallback for better user experience
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        login();
        // Navigate to the transactions screen
        router.push("/(transactions)/transactionsList");
      } else if (result.error === "user_cancel") {
        // User canceled, do nothing specific here
        console.log("User canceled authentication");
      } else if (result.error === "lockout") {
        Alert.alert(
          "Face ID Temporarily Disabled",
          "Too many failed attempts. Please try again later or use your device passcode."
        );
      } else {
        // Only show alert for non-cancel errors
        Alert.alert(
          "Authentication Failed",
          "Please make sure your face is clearly visible to the camera and try again."
        );
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Authentication Error",
        "There was a problem with Face ID. Please make sure Face ID is properly set up on your device."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get the appropriate auth button text
  const getAuthButtonText = () => {
    if (!biometricType) return "Biometrics Not Available";

    switch (biometricType) {
      case "facial":
        return "Authenticate with Face ID";
      case "fingerprint":
        return Platform.OS === "ios"
          ? "Authenticate with Touch ID"
          : "Authenticate with Fingerprint";
      default:
        return "Authenticate with Biometrics";
    }
  };

  // Get appropriate icon component
  const getAuthIcon = () => {
    if (biometricType === "facial") {
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
          disabled={isLoading || !biometricType}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {getAuthIcon()}
              <Text className="text-white text-base font-semibold ml-2">
                {getAuthButtonText()}
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
