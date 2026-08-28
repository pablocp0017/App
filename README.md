# Mis Finanzas

App móvil (Expo / React Native + TypeScript) para controlar tus finanzas personales: activo (efectivo, banco, inversiones) y pasivo (deudas y gastos por categoría).

## Funcionalidades

- **Activo total y Pasivo total** en la parte superior del panel principal.
- **Fondo de emergencia** recomendado (gasto mensual × nº de meses configurado) con barra de cobertura respecto a tu efectivo + banco disponible.
- **Mes en curso**: la app abre siempre en el mes actual (por ejemplo, septiembre) y permite navegar a meses anteriores para consultar el histórico.
- **Ingresos y gastos del mes**, junto con el **límite de gasto mensual** que tú definas, con barra de progreso que avisa si te pasas.
- **Gráfico circular** de gastos por categoría (comida, ropa, ocio, transporte, piso, deporte, regalos, pago de deudas, otros).
- **Botón flotante (+)** en la esquina inferior derecha para registrar un ingreso o gasto manualmente, indicando si afecta a efectivo o banco.
- **Cuentas** (icono de cartera): gestiona efectivo, banco e inversiones.
  - Cada cuenta bancaria puede activar "Actualización automática": si el banco reporta un movimiento (por ejemplo, un ingreso de 100€), lo registras una vez y se refleja automáticamente tanto en el saldo del banco como en el activo total.
  - Las inversiones incluyen un interés anual estimado y la app calcula el rendimiento mensual/anual generado.
- **Deudas** (icono de documento): registra cada deuda con su importe pendiente, cuota mensual y TAE; la app calcula el interés mensual que estás pagando. Al pagar una cuota como gasto de categoría "Pago de deuda" vinculado a esa deuda, el importe pendiente se reduce automáticamente.
- **Ajustes** (icono de engranaje): define los meses de colchón para el fondo de emergencia y el límite de gasto mensual.

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
  components/            Componentes reutilizables (tarjetas, gráfico circular, FAB, selector de mes)
  navigation/            Stack de navegación
  screens/               Pantallas: Dashboard, Registrar movimiento, Cuentas, Deudas, Ajustes
```
