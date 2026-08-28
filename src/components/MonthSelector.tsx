import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
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
      <TouchableOpacity onPress={onPrev} style={styles.arrowButton} hitSlop={10}>
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{monthLabel(monthKey)}</Text>
      <TouchableOpacity
        onPress={onNext}
        style={styles.arrowButton}
        hitSlop={10}
        disabled={disableNext}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={disableNext ? colors.border : colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
  },
  monthText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
    minWidth: 160,
    textAlign: 'center',
  },
  arrowButton: {
    padding: 6,
  },
});
