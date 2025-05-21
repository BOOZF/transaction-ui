type Merchant = {
  name: string;
  location?: string;
};

type Transaction = {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: "credit" | "debit";
  category: string;
  status: "pending" | "completed" | "failed";
  reference?: string;
  merchant?: Merchant;
};

type TransactionItemProps = {
  transaction: Transaction;
  onPress: () => void;
  amountsVisible: boolean;
};
