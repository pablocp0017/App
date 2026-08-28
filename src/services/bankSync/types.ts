import { ExpenseCategory, TransactionType } from '../../types';

/** Institución bancaria disponible para conectar vía Open Banking (PSD2 AISP) */
export interface BankInstitution {
  id: string;
  name: string;
}

/** Movimiento devuelto por el proveedor Open Banking al sincronizar */
export interface BankSyncMovement {
  externalId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: ExpenseCategory;
  /** yyyy-MM-dd */
  date: string;
}

/**
 * Contrato que debe implementar cualquier proveedor Open Banking (Plaid, Tink, GoCardless
 * Bank Account Data, Salt Edge, etc.). En producción, `connect` dispara el flujo de
 * consentimiento OAuth del banco a través del backend del proveedor, y `fetchNewMovements`
 * llama a su API de transacciones (o recibe los datos vía webhook) usando el access token
 * obtenido durante el consentimiento.
 */
export interface BankSyncProvider {
  listInstitutions(): Promise<BankInstitution[]>;
  connect(institutionId: string): Promise<{ institutionName: string }>;
  disconnect(): Promise<void>;
  fetchNewMovements(sinceISO?: string): Promise<BankSyncMovement[]>;
}
