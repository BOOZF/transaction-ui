import React from "react";
import { Text, View } from "react-native";

export default function TransactionDetailsItems({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactNode {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-sm text-[#666666]">{label}</Text>
      <Text className="text-sm text-[#1A1A1A] font-medium max-w-[60%] text-right">
        {value}
      </Text>
    </View>
  );
}
