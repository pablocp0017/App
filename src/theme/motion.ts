import { Easing } from 'react-native-reanimated';

// Curvas y duraciones según las guías de animación de Apple / animate-expo:
// nunca ease-in en UI, springs solo cuando hay gesto de por medio.
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const durations = {
  press: 120,
  fast: 180,
  base: 260,
  slow: 400,
};

export const springDefault = { duration: 400, dampingRatio: 1 };
export const springSettle = { duration: 300, dampingRatio: 0.85 };

export const PRESS_SCALE = 0.97;
