import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import { monthLabel } from '../utils/dateUtils';

interface Props {
  monthKey: string;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

export default function MonthSelector({ monthKey, onPrev, onNext, disableNext }: Props) {
  return (
    <View style={styles.container}>
      <PressableScale onPress={onPrev} style={styles.arrowButton} hitSlop={10} scaleTo={0.85}>
        <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
      </PressableScale>
      <Text style={styles.monthText}>{monthLabel(monthKey)}</Text>
      <PressableScale
        onPress={onNext}
        style={styles.arrowButton}
        hitSlop={10}
        scaleTo={0.85}
        disabled={disableNext}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={disableNext ? colors.textTertiary : colors.textPrimary}
        />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  monthText: {
    ...typography.title,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    minWidth: 160,
    textAlign: 'center',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
