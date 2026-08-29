import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { CategoryTotal, formatCurrency } from '../utils/calculations';
import { EXPENSE_CATEGORY_COLORS, EXPENSE_CATEGORY_LABELS } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { EASE_OUT, durations } from '../theme/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

function Slice({ d, color, index }: { d: string; color: string; index: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.set(
      withDelay(index * 60, withTiming(1, { duration: durations.base, easing: EASE_OUT }))
    );
  }, [index, opacity]);

  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.get() }));

  return <AnimatedPath d={d} fill={color} animatedProps={animatedProps} />;
}

export default function ExpensePieChart({ data, size = 180 }: Props) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const radius = size / 2;

  if (total === 0) {
    return (
      <View style={[styles.emptyContainer, { width: size, height: size }]}>
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
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {slices.map((slice, index) => (
            <Slice
              key={slice.category}
              index={index}
              color={EXPENSE_CATEGORY_COLORS[slice.category]}
              d={arcPath(radius, radius, radius - 2, slice.startAngle, slice.endAngle)}
            />
          ))}
          <Circle cx={radius} cy={radius} r={radius * 0.62} fill={colors.surface} />
        </Svg>
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.centerCaption}>Total</Text>
          <Text style={styles.centerValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
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
    gap: 18,
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  centerCaption: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  centerValue: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: 2,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
    flexGrow: 1,
  },
  legendValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
