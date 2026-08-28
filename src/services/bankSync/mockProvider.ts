import { BankInstitution, BankSyncMovement, BankSyncProvider } from './types';
import { todayISODate } from '../../utils/dateUtils';

/**
 * Proveedor Open Banking de demostración.
 *
 * IMPORTANTE: esto NO habla con ningún banco real. Un proveedor Open Banking real
 * (Plaid, Tink, GoCardless Bank Account Data, Salt Edge...) requiere:
 *  - Credenciales de proveedor y un backend propio que guarde el access token
 *    (nunca debe vivir en el móvil).
 *  - Un flujo de consentimiento OAuth con el banco del usuario.
 *  - Un endpoint/webhook que reciba las transacciones reales de la cuenta.
 *
 * Este mock simula ese contrato para que la app funcione end-to-end hoy mismo. Cuando se
 * disponga de credenciales de un proveedor real, basta con crear una clase que implemente
 * `BankSyncProvider` haciendo las llamadas reales y sustituir `mockBankSyncProvider` por
 * ella en `src/store/useFinanceStore.ts`.
 */

const MOCK_INSTITUTIONS: BankInstitution[] = [
  { id: 'demo-santander', name: 'Banco Santander (demo)' },
  { id: 'demo-bbva', name: 'BBVA (demo)' },
  { id: 'demo-caixabank', name: 'CaixaBank (demo)' },
  { id: 'demo-ing', name: 'ING (demo)' },
];

const SAMPLE_MOVEMENTS: Omit<BankSyncMovement, 'externalId' | 'date'>[] = [
  { type: 'income', amount: 1450, description: 'Nómina' },
  { type: 'expense', amount: 38.5, description: 'Supermercado', category: 'comida' },
  { type: 'expense', amount: 19.99, description: 'Suscripción streaming', category: 'ocio' },
  { type: 'expense', amount: 65, description: 'Gasolinera', category: 'transporte' },
  { type: 'expense', amount: 12.3, description: 'Farmacia', category: 'otros' },
];

let movementCursor = 0;

export const mockBankSyncProvider: BankSyncProvider = {
  async listInstitutions() {
    return MOCK_INSTITUTIONS;
  },

  async connect(institutionId: string) {
    const institution = MOCK_INSTITUTIONS.find((i) => i.id === institutionId);
    if (!institution) {
      throw new Error('Entidad bancaria no reconocida');
    }
    return { institutionName: institution.name };
  },

  async disconnect() {
    movementCursor = 0;
  },

  async fetchNewMovements() {
    // Simula que el banco reporta 1-2 movimientos nuevos desde la última sincronización.
    const count = Math.random() > 0.5 ? 2 : 1;
    const movements: BankSyncMovement[] = [];
    for (let i = 0; i < count; i += 1) {
      const sample = SAMPLE_MOVEMENTS[movementCursor % SAMPLE_MOVEMENTS.length];
      movementCursor += 1;
      movements.push({
        ...sample,
        externalId: `mock-${Date.now()}-${movementCursor}`,
        date: todayISODate(),
      });
    }
    return movements;
  },
};
