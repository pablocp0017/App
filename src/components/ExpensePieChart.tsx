import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { CategoryTotal, formatCurrency } from '../utils/calculations';
import { EXPENSE_CATEGORY_COLORS, EXPENSE_CATEGORY_LABELS } from '../types';
import { colors } from '../theme/colors';

interface Props {
  data: CategoryTotal[];
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function ExpensePieChart({ data, size = 200 }: Props) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const radius = size / 2;

  if (total === 0) {
    return (
      <View style={[styles.emptyContainer, { width: size, height: size }]}>
        <Circle cx={radius} cy={radius} r={radius - 4} fill="none" />
        <Text style={styles.emptyText}>Sin gastos{'\n'}este mes</Text>
      </View>
    );
  }

  let cumulativeAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.total / total) * 360;
    const slice = {
      category: d.category,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
      total: d.total,
    };
    cumulativeAngle += angle;
    return slice;
  });

  return (
    <View style={styles.row}>
      <Svg width={size} height={size}>
        {slices.map((slice) => (
          <Path
            key={slice.category}
            d={arcPath(radius, radius, radius - 2, slice.startAngle, slice.endAngle)}
            fill={EXPENSE_CATEGORY_COLORS[slice.category]}
          />
        ))}
        <Circle cx={radius} cy={radius} r={radius * 0.55} fill={colors.surface} />
      </Svg>
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.category} style={styles.legendRow}>
            <View
              style={[styles.legendDot, { backgroundColor: EXPENSE_CATEGORY_COLORS[d.category] }]}
            />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {EXPENSE_CATEGORY_LABELS[d.category]}
            </Text>
            <Text style={styles.legendValue}>{formatCurrency(d.total)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    flexShrink: 1,
    flexGrow: 1,
  },
  legendValue: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
});
