import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {
  AssetAccount,
  BankConnection,
  Debt,
  Settings,
  Transaction,
} from '../types';
import { mockBankSyncProvider } from '../services/bankSync/mockProvider';

interface FinanceState {
  accounts: AssetAccount[];
  debts: Debt[];
  transactions: Transaction[];
  settings: Settings;
  bankConnection: BankConnection;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  // Cuentas de activo
  addAccount: (account: Omit<AssetAccount, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<AssetAccount>) => void;
  removeAccount: (id: string) => void;

  // Deudas
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  removeDebt: (id: string) => void;

  // Transacciones
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;

  // Open Banking: conexión y sincronización con la cuenta bancaria real
  connectBank: (institutionId: string) => Promise<void>;
  disconnectBank: () => Promise<void>;
  syncBankTransactions: () => Promise<number>;

  // Ajustes
  updateSettings: (updates: Partial<Settings>) => void;
}

const CASH_ACCOUNT_ID = 'cash-default';
const BANK_ACCOUNT_ID = 'bank-default';

const defaultAccounts: AssetAccount[] = [
  { id: CASH_ACCOUNT_ID, type: 'cash', name: 'Efectivo', balance: 0, protected: true },
  { id: BANK_ACCOUNT_ID, type: 'bank', name: 'Cuenta bancaria', balance: 0, protected: true },
];

const defaultSettings: Settings = {
  emergencyFundMonths: 3,
  monthlyExpenseLimit: 0,
};

const defaultBankConnection: BankConnection = {
  connected: false,
};

function applyBalanceDelta(
  accounts: AssetAccount[],
  accountId: string,
  delta: number
): AssetAccount[] {
  return accounts.map((acc) =>
    acc.id === accountId ? { ...acc, balance: acc.balance + delta } : acc
  );
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: defaultAccounts,
      debts: [],
      transactions: [],
      settings: defaultSettings,
      bankConnection: defaultBankConnection,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: uuidv4() }],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id || acc.protected),
        })),

      addDebt: (debt) =>
        set((state) => ({
          debts: [...state.debts, { ...debt, id: uuidv4() }],
        })),

      updateDebt: (id, updates) =>
        set((state) => ({
          debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      removeDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),

      addTransaction: (transaction) =>
        set((state) => {
          const delta =
            transaction.type === 'income' ? transaction.amount : -transaction.amount;
          const accounts = applyBalanceDelta(state.accounts, transaction.accountId, delta);

          let debts = state.debts;
          if (transaction.type === 'expense' && transaction.debtId) {
            debts = debts.map((d) =>
              d.id === transaction.debtId
                ? { ...d, remainingAmount: Math.max(0, d.remainingAmount - transaction.amount) }
                : d
            );
          }

          return {
            accounts,
            debts,
            transactions: [...state.transactions, { ...transaction, id: uuidv4() }],
          };
        }),

      removeTransaction: (id) =>
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id);
          if (!tx) return {};
          const reverseDelta = tx.type === 'income' ? -tx.amount : tx.amount;
          const accounts = applyBalanceDelta(state.accounts, tx.accountId, reverseDelta);

          let debts = state.debts;
          if (tx.type === 'expense' && tx.debtId) {
            debts = debts.map((d) =>
              d.id === tx.debtId
                ? { ...d, remainingAmount: d.remainingAmount + tx.amount }
                : d
            );
          }

          return {
            accounts,
            debts,
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        }),

      connectBank: async (institutionId) => {
        const { institutionName } = await mockBankSyncProvider.connect(institutionId);
        set({
          bankConnection: {
            connected: true,
            institutionName,
            accountId: BANK_ACCOUNT_ID,
            lastSyncAt: undefined,
          },
        });
        await get().syncBankTransactions();
      },

      disconnectBank: async () => {
        await mockBankSyncProvider.disconnect();
        set({ bankConnection: defaultBankConnection });
      },

      syncBankTransactions: async () => {
        const { bankConnection } = get();
        if (!bankConnection.connected || !bankConnection.accountId) return 0;

        const movements = await mockBankSyncProvider.fetchNewMovements(bankConnection.lastSyncAt);
        movements.forEach((movement) => {
          get().addTransaction({
            type: movement.type,
            amount: movement.amount,
            date: movement.date,
            description: movement.description,
            accountId: bankConnection.accountId as string,
            category: movement.category,
            isAutomatic: true,
          });
        });

        set((state) => ({
          bankConnection: { ...state.bankConnection, lastSyncAt: new Date().toISOString() },
        }));

        return movements.length;
      },

      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
    }),
    {
      name: 'finance-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
