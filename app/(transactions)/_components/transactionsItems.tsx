import { formatCurrency, formatDate } from "@/app/utils/formatters";
import {
  ArrowLeftRight,
  Banknote,
  Car,
  CreditCard,
  Film,
  ShoppingCart,
  Utensils,
  Zap,
} from "lucide-react-native";
import type React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TransactionItem({
  transaction,
  onPress,
  amountsVisible,
}: TransactionItemProps) {
  const { type, description, amount, date, category } = transaction;

  const getIcon = () => {
    const iconColor = type === "credit" ? "#0047CC" : "#FF9800";
    const size = 20;

    switch (category) {
      case "shopping":
        return <ShoppingCart size={size} color={iconColor} />;
      case "food":
        return <Utensils size={size} color={iconColor} />;
      case "transport":
        return <Car size={size} color={iconColor} />;
      case "entertainment":
        return <Film size={size} color={iconColor} />;
      case "utilities":
        return <Zap size={size} color={iconColor} />;
      case "salary":
        return <Banknote size={size} color={iconColor} />;
      case "transfer":
        return <ArrowLeftRight size={size} color={iconColor} />;
      default:
        return <CreditCard size={size} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
      onPress={onPress}
    >
      <View
        className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
          type === "credit" ? "bg-[#E3F2FD]" : "bg-[#FFF3E0]"
        }`}
      >
        {getIcon()}
      </View>

      <View className="flex-1">
        <Text
          className="text-base font-medium text-[#1A1A1A] mb-1"
          numberOfLines={1}
        >
          {description}
        </Text>
        <Text className="text-sm text-[#666666]">{formatDate(date)}</Text>
      </View>

      <View className="items-end">
        <Text
          className={`text-base font-semibold mb-1 ${
            type === "credit" ? "text-[#0047CC]" : "text-[#FF3B30]"
          }`}
        >
          {amountsVisible
            ? `${type === "credit" ? "+" : "-"}${formatCurrency(amount)}`
            : "••••••••"}
        </Text>
        <View
          className={`px-2 py-1 rounded-xl ${
            type === "credit" ? "bg-[#E3F2FD]" : "bg-[#FFF3E0]"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              type === "credit" ? "text-[#0047CC]" : "text-[#FF9800]"
            }`}
          >
            {type === "credit" ? "Received" : "Sent"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
