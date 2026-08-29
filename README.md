# Mis Finanzas

App móvil (Expo / React Native + TypeScript) para controlar tus finanzas personales: activo (efectivo, banco, inversiones) y pasivo (deudas y gastos por categoría).

## Diseño

La app usa navegación por **pestañas inferiores** (Resumen, Cuentas, Deudas, Banco) y un sistema visual propio en `src/theme/` (colores, tipografía con jerarquía tipo Apple, espaciado y curvas/tiempos de animación). Las interacciones usan Reanimated para sentirse "físicas": feedback de escala al pulsar (con háptica selectiva), entrada escalonada de las tarjetas, barras de progreso animadas y un gráfico de donut cuyos segmentos aparecen con un pequeño retraso entre sí.

## Funcionalidades

- **Pestaña Resumen**: tarjeta de patrimonio neto (activo − pasivo) con el desglose de activo y pasivo total, fondo de emergencia recomendado (gasto mensual × nº de meses configurado) con barra de cobertura, selector del mes en curso (abre siempre en el mes actual, p. ej. septiembre), ingresos y gastos del mes, límite de gasto mensual con barra de progreso, y un gráfico de donut de gastos por categoría (comida, ropa, ocio, transporte, piso, deporte, regalos, pago de deudas, otros) con el total en el centro.
- **Botón flotante (+)** en la esquina inferior derecha del Resumen, para registrar un ingreso o gasto manualmente, indicando si afecta a efectivo o banco.
- **Fondo de emergencia y límite mensual** se editan directamente desde el propio Resumen (icono de lápiz en cada tarjeta), no desde un menú de ajustes aparte.
- **Pestaña Cuentas**: gestiona efectivo, banco e inversiones.
  - Las cuentas de "Efectivo" y "Cuenta bancaria" son fijas (no se pueden eliminar), pero su saldo se puede ajustar en cualquier momento con el icono de lápiz — útil para introducir el efectivo o saldo que ya tienes sin que cuente como un ingreso del mes.
  - Solo se pueden añadir cuentas adicionales de tipo inversión, con su interés anual estimado; la app calcula el rendimiento mensual/anual generado.
  - La cuenta bancaria muestra el estado de la conexión Open Banking (ver más abajo).
- **Pestaña Deudas**: registra cada deuda con su importe pendiente, cuota mensual y TAE; la app calcula el interés mensual que estás pagando. Al pagar una cuota como gasto de categoría "Pago de deuda" vinculado a esa deuda, el importe pendiente se reduce automáticamente.
- **Pestaña Banco (Open Banking)**: conecta tu entidad bancaria mediante un flujo de consentimiento (PSD2). Una vez conectada, los ingresos y gastos de tu cuenta se importan y reflejan solos en el activo y en el saldo del banco, sin introducir nada a mano — con sincronización automática periódica y un botón de "Sincronizar ahora".
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
  theme/                 Colores, tipografía, espaciado/radios y curvas de animación
  components/            Componentes reutilizables (tarjetas, donut animado, FAB, PressableScale,
                         barra de progreso animada, selector de mes, modal de edición)
  services/bankSync/     Interfaz BankSyncProvider + proveedor Open Banking simulado
  navigation/            Stack raíz (modal Registrar movimiento) + pestañas inferiores (MainTabs)
  screens/               Pantallas: Dashboard, Registrar movimiento, Cuentas, Deudas, Banco (Open Banking)
```

Nota sobre el "feel" de las animaciones: se ha comprobado que compilan y arrancan (bundle de Metro sin errores), pero el tacto real de los springs y el feedback háptico solo se puede validar en un dispositivo físico con un build de producción — no hay emulador disponible en este entorno.
