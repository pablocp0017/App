import { AssetAccount, Debt, ExpenseCategory, Settings, Transaction } from '../types';
import { monthKeyFromDateString } from './dateUtils';

export function totalAssets(accounts: AssetAccount[]): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

export function totalDebts(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.remainingAmount, 0);
}

/** Pasivo total: deudas pendientes + gastos del mes actual (aún no cubiertos) */
export function totalLiabilities(debts: Debt[], monthlyExpenses: number): number {
  return totalDebts(debts) + monthlyExpenses;
}

/** Fondo de emergencia recomendado = gasto medio mensual * meses deseados */
export function emergencyFundTarget(monthlyExpenses: number, months: number): number {
  return monthlyExpenses * months;
}

export function transactionsForMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => monthKeyFromDateString(t.date) === monthKey);
}

export function monthlyIncome(transactions: Transaction[], monthKey: string): number {
  return transactionsForMonth(transactions, monthKey)
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthlyExpenses(transactions: Transaction[], monthKey: string): number {
  return transactionsForMonth(transactions, monthKey)
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
}

export function expensesByCategory(transactions: Transaction[], monthKey: string): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>();
  transactionsForMonth(transactions, monthKey)
    .filter((t) => t.type === 'expense' && t.category)
    .forEach((t) => {
      const cat = t.category as ExpenseCategory;
      totals.set(cat, (totals.get(cat) ?? 0) + t.amount);
    });
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/** Coste mensual total de deudas (suma de cuotas) */
export function totalMonthlyDebtPayments(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
}

/** Interés estimado que se paga al año por una deuda, en base a su saldo pendiente */
export function debtAnnualInterestCost(debt: Debt): number {
  return debt.remainingAmount * (debt.annualInterestRate / 100);
}

export function debtMonthlyInterestCost(debt: Debt): number {
  return debtAnnualInterestCost(debt) / 12;
}

/** Interés generado al año por una inversión */
export function investmentAnnualReturn(account: AssetAccount): number {
  if (account.type !== 'investment' || !account.annualInterestRate) return 0;
  return account.balance * (account.annualInterestRate / 100);
}

export function investmentMonthlyReturn(account: AssetAccount): number {
  return investmentAnnualReturn(account) / 12;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
