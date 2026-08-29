import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

interface Props {
  onPress: () => void;
}

export default function Fab({ onPress }: Props) {
  return (
    <Animated.View entering={ZoomIn.delay(200).duration(280)} style={styles.wrapper}>
      <PressableScale style={styles.fab} onPress={onPress} scaleTo={0.92} haptic={false}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 28,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
