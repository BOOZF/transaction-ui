import { formatCurrency, formatDate } from "@/app/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
  amountsVisible: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  amountsVisible,
}) => {
  const { type, description, amount, date, category } = transaction;

  const getIconName = () => {
    switch (category) {
      case "shopping":
        return "cart-outline";
      case "food":
        return "restaurant-outline";
      case "transport":
        return "car-outline";
      case "entertainment":
        return "film-outline";
      case "utilities":
        return "flash-outline";
      case "salary":
        return "cash-outline";
      case "transfer":
        return "swap-horizontal-outline";
      default:
        return "card-outline";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: type === "credit" ? "#E3F2FD" : "#FFF3E0" },
        ]}
      >
        <Ionicons
          name={getIconName()}
          size={20}
          color={type === "credit" ? "#0047CC" : "#FF9800"}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: type === "credit" ? "#0047CC" : "#FF3B30" },
          ]}
        >
          {amountsVisible
            ? `${type === "credit" ? "+" : "-"}${formatCurrency(amount)}`
            : "••••••••"}
        </Text>
        <View
          style={[
            styles.typeIndicator,
            { backgroundColor: type === "credit" ? "#E3F2FD" : "#FFF3E0" },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              { color: type === "credit" ? "#0047CC" : "#FF9800" },
            ]}
          >
            {type === "credit" ? "Received" : "Sent"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666666",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default TransactionItem;
