import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

interface Props {
  label: string;
  value: string;
  valueColor?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function SummaryCard({ label, value, valueColor, subtitle, icon, iconColor }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {icon && (
          <View style={[styles.iconBadge, { backgroundColor: `${iconColor ?? colors.accent}22` }]}>
            <Ionicons name={icon} size={13} color={iconColor ?? colors.accent} />
          </View>
        )}
      </View>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.numeric,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
