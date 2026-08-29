import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { EASE_OUT, PRESS_SCALE, durations } from '../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  children: React.ReactNode;
}

/**
 * Envoltorio de Pressable con feedback de escala en el hilo de UI (Reanimated).
 * Uso: cualquier elemento pulsable que deba sentirse "físico" (botones, tarjetas, FAB).
 */
export default function PressableScale({
  style,
  scaleTo = PRESS_SCALE,
  haptic = true,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.set(withTiming(scaleTo, { duration: durations.press, easing: EASE_OUT }));
        if (haptic) Haptics.selectionAsync();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: durations.press, easing: EASE_OUT }));
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
