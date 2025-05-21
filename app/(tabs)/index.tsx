import { Image } from "expo-image";
import { Home, Info, RefreshCw } from "lucide-react-native";
import { Platform, ScrollView } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          className="h-44 w-72 absolute bottom-0 left-0"
        />
      </View>
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-6 mt-48">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome!
          </Text>
          <HelloWave />
        </View>

        <View className="h-4" />

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <Home size={24} className="text-blue-500" />
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">
              Step 1: Try it
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300">
            Edit <Text className="font-semibold">app/(tabs)/index.tsx</Text> to
            see changes. Press{" "}
            <Text className="font-semibold">
              {Platform.select({
                ios: "cmd + d",
                android: "cmd + m",
                web: "F12",
              })}
            </Text>{" "}
            to open developer tools.
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <Info size={24} className="text-blue-500" />
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">
              Step 2: Explore
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300">
            {`Tap the Explore tab to learn more about what's included in this starter app.`}
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <RefreshCw size={24} className="text-blue-500" />
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">
              Step 3: Get a fresh start
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300">
            {`When you're ready, run `}
            <Text className="font-semibold">npm run reset-project</Text> to get
            a fresh <Text className="font-semibold">app</Text> directory. This
            will move the current <Text className="font-semibold">app</Text> to{" "}
            <Text className="font-semibold">app-example</Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
