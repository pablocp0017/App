import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { EASE_OUT, durations } from '../theme/motion';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

interface Props {
  progress: number; // 0-100
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function AnimatedProgressBar({
  progress,
  color = colors.accent,
  trackColor = colors.surfaceElevated,
  height = 8,
}: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(withTiming(Math.max(0, Math.min(100, progress)), {
      duration: durations.slow,
      easing: EASE_OUT,
    }));
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.get()}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[styles.fill, fillStyle, { backgroundColor: color, borderRadius: height / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
});
