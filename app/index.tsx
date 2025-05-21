"use client";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import AuthContext
import { AuthProvider, useAuth } from "./(transactions)/context/authContext";

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
        router.push("/(transactions)/transactions");
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

  // Get appropriate icon
  const getAuthIcon = () => {
    if (biometricType === "facial") {
      return "https://placeholder.svg?height=24&width=24&text=face";
    }
    return "https://placeholder.svg?height=24&width=24&text=finger";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: "https://placeholder.svg?height=100&width=100" }}
          style={styles.logo}
        />
        <Text style={styles.appName}>Ryt Bank</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.subtitle}>
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
          style={styles.authButton}
          onPress={handleBiometricAuth}
          disabled={isLoading || !biometricType}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image source={{ uri: getAuthIcon() }} style={styles.authIcon} />
              <Text style={styles.authButtonText}>{getAuthButtonText()}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure Banking • Trusted Service</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0047CC",
    marginTop: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0047CC",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 300,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  authIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
});
