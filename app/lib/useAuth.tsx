import { useAuth } from "@/components/auth/authContext";
import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export function useAuthFunctions() {
  const router = useRouter();
  const { login } = useAuth();
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
      console.log("supportedTypes", supportedTypes);
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

  // Define biometric authentication mutation
  const biometricAuthMutation = useMutation({
    mutationFn: async (): Promise<AuthResult> => {
      // Check if we have permission to use local authentication
      const permission = await LocalAuthentication.hasHardwareAsync();
      if (!permission) {
        throw new Error(
          "This device does not support biometric authentication"
        );
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error(
          "Please set up Face ID in your device settings to use this feature"
        );
      }

      // Attempt biometric authentication with user-friendly options
      return await LocalAuthentication.authenticateAsync({
        promptMessage: "Use Face ID to access your transactions",
        // Allow passcode fallback for better user experience
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
        biometricsSecurityLevel: "strong",
      });
    },
    onSuccess: (result: AuthResult) => {
      if (result.success) {
        login();
        // Navigate to the transactions screen
        router.push("/transactions/transactionsList");
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
    },
    onError: (error: Error) => {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Authentication Error",
        "There was a problem with Face ID. Please make sure Face ID is properly set up on your device."
      );
    },
  });

  const handleBiometricAuth = () => {
    biometricAuthMutation.mutate();
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
      return "facial";
    }
    return "fingerprint";
  };

  return {
    biometricType,
    biometricAuthMutation,
    handleBiometricAuth,
    getAuthButtonText,
    getAuthIcon,
  };
}
