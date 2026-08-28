import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {
  AssetAccount,
  Debt,
  Settings,
  Transaction,
} from '../types';

interface FinanceState {
  accounts: AssetAccount[];
  debts: Debt[];
  transactions: Transaction[];
  settings: Settings;
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

  // Simulación de ingreso automático del banco
  applyAutomaticBankMovement: (params: {
    accountId: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    category?: Transaction['category'];
  }) => void;

  // Ajustes
  updateSettings: (updates: Partial<Settings>) => void;
}

const defaultAccounts: AssetAccount[] = [
  { id: 'cash-default', type: 'cash', name: 'Efectivo', balance: 0 },
  { id: 'bank-default', type: 'bank', name: 'Cuenta bancaria', balance: 0, autoSyncEnabled: false },
];

const defaultSettings: Settings = {
  emergencyFundMonths: 3,
  monthlyExpenseLimit: 0,
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
          accounts: state.accounts.filter((acc) => acc.id !== id),
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

      applyAutomaticBankMovement: ({ accountId, amount, type, description, category }) => {
        get().addTransaction({
          type,
          amount,
          date: new Date().toISOString().slice(0, 10),
          description,
          accountId,
          category,
          isAutomatic: true,
        });
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
