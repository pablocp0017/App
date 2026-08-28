// Modelos de datos de la aplicación de finanzas personales

export type AssetAccountType = 'cash' | 'bank' | 'investment';

export interface AssetAccount {
  id: string;
  type: AssetAccountType;
  name: string;
  balance: number;
  /** Interés anual estimado que genera la inversión (%), solo aplica a type === 'investment' */
  annualInterestRate?: number;
  /** Si es la cuenta bancaria que recibe actualizaciones automáticas simuladas */
  autoSyncEnabled?: boolean;
}

export type ExpenseCategory =
  | 'comida'
  | 'ropa'
  | 'ocio'
  | 'transporte'
  | 'piso'
  | 'deporte'
  | 'regalos'
  | 'deuda'
  | 'otros';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'comida',
  'ropa',
  'ocio',
  'transporte',
  'piso',
  'deporte',
  'regalos',
  'deuda',
  'otros',
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  comida: 'Comida',
  ropa: 'Ropa',
  ocio: 'Ocio',
  transporte: 'Transporte',
  piso: 'Piso',
  deporte: 'Deporte',
  regalos: 'Regalos',
  deuda: 'Pago de deuda',
  otros: 'Otros',
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  comida: '#F4A259',
  ropa: '#BC4B51',
  ocio: '#8CB369',
  transporte: '#5B8E7D',
  piso: '#5C6B73',
  deporte: '#3E92CC',
  regalos: '#D883B7',
  deuda: '#9B5DE5',
  otros: '#B0A8B9',
};

export interface Debt {
  id: string;
  name: string;
  /** Cantidad total pendiente de la deuda */
  remainingAmount: number;
  /** Cuota mensual que se paga por la deuda */
  monthlyPayment: number;
  /** Interés anual (TAE aproximada) que se paga por la deuda, en % */
  annualInterestRate: number;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  /** yyyy-MM-dd */
  date: string;
  description: string;
  /** Cuenta de activo afectada (banco o efectivo) */
  accountId: string;
  /** Solo para gastos */
  category?: ExpenseCategory;
  /** Si el gasto corresponde al pago de una deuda concreta */
  debtId?: string;
  /** Si la transacción fue generada automáticamente por la sincronización bancaria simulada */
  isAutomatic?: boolean;
}

export interface Settings {
  /** Meses de gastos que se quieren tener cubiertos por el fondo de emergencia */
  emergencyFundMonths: number;
  /** Límite de gasto mensual establecido por el usuario */
  monthlyExpenseLimit: number;
}
