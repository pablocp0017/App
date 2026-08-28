# Mis Finanzas

App móvil (Expo / React Native + TypeScript) para controlar tus finanzas personales: activo (efectivo, banco, inversiones) y pasivo (deudas y gastos por categoría).

## Funcionalidades

- **Activo total y Pasivo total** en la parte superior del panel principal.
- **Fondo de emergencia** recomendado (gasto mensual × nº de meses configurado) con barra de cobertura respecto a tu efectivo + banco disponible.
- **Mes en curso**: la app abre siempre en el mes actual (por ejemplo, septiembre) y permite navegar a meses anteriores para consultar el histórico.
- **Ingresos y gastos del mes**, junto con el **límite de gasto mensual** que tú definas, con barra de progreso que avisa si te pasas.
- **Gráfico circular** de gastos por categoría (comida, ropa, ocio, transporte, piso, deporte, regalos, pago de deudas, otros).
- **Botón flotante (+)** en la esquina inferior derecha para registrar un ingreso o gasto manualmente, indicando si afecta a efectivo o banco.
- **Fondo de emergencia y límite mensual** se editan directamente desde el propio panel principal (icono de lápiz en cada tarjeta), no desde un menú de ajustes aparte.
- **Cuentas** (icono de cartera): gestiona efectivo, banco e inversiones.
  - Las cuentas de "Efectivo" y "Cuenta bancaria" son fijas (no se pueden eliminar), pero su saldo se puede ajustar en cualquier momento con el icono de lápiz — útil para introducir el efectivo o saldo que ya tienes sin que cuente como un ingreso del mes.
  - Solo se pueden añadir cuentas adicionales de tipo inversión, con su interés anual estimado; la app calcula el rendimiento mensual/anual generado.
  - La cuenta bancaria muestra el estado de la conexión Open Banking (ver más abajo).
- **Deudas** (icono de documento): registra cada deuda con su importe pendiente, cuota mensual y TAE; la app calcula el interés mensual que estás pagando. Al pagar una cuota como gasto de categoría "Pago de deuda" vinculado a esa deuda, el importe pendiente se reduce automáticamente.
- **Banco / Open Banking** (icono de enlace o sincronización en el panel principal): conecta tu entidad bancaria mediante un flujo de consentimiento (PSD2). Una vez conectada, los ingresos y gastos de tu cuenta se importan y reflejan solos en el activo y en el saldo del banco, sin introducir nada a mano — con sincronización automática periódica y un botón de "Sincronizar ahora".
  - **Importante**: esta demo simula el proveedor Open Banking (no se conecta a un banco real). Una integración real requiere un proveedor certificado (Plaid, Tink, GoCardless Bank Account Data, Salt Edge...) y un backend propio que gestione el consentimiento OAuth y las credenciales de forma segura; nunca deben vivir en el móvil. El código está preparado para ello: basta con implementar `BankSyncProvider` (`src/services/bankSync/types.ts`) con llamadas reales y sustituir `mockBankSyncProvider` en `src/store/useFinanceStore.ts`.

Los datos se guardan localmente en el dispositivo (AsyncStorage), por lo que persisten entre sesiones sin necesidad de servidor.

## Cómo ejecutar la app

```bash
npm install
npm run start
```

Esto abrirá Expo Dev Tools / un código QR. Instala la app **Expo Go** en tu móvil (Android o iOS) y escanea el código QR para probar la app en tu dispositivo, o usa `npm run android` / `npm run ios` con un emulador instalado.

## Estructura del proyecto

```
App.tsx                  Punto de entrada, navegación y proveedor de gestos
src/
  types/                 Modelos de datos (cuentas, deudas, transacciones, categorías)
  store/                 Estado global (zustand) con persistencia en AsyncStorage
  utils/                 Cálculos financieros y utilidades de fecha
  theme/                 Paleta de colores
  components/            Componentes reutilizables (tarjetas, gráfico circular, FAB, selector de mes, modal de edición)
  services/bankSync/     Interfaz BankSyncProvider + proveedor Open Banking simulado
  navigation/            Stack de navegación
  screens/               Pantallas: Dashboard, Registrar movimiento, Cuentas, Deudas, Banco (Open Banking)
```
