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

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

type AuthResult = {
  success: boolean;
  error?: string;
};
