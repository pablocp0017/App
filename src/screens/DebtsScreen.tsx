import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import {
  debtMonthlyInterestCost,
  formatCurrency,
  totalMonthlyDebtPayments,
} from '../utils/calculations';
import PressableScale from '../components/PressableScale';

export default function DebtsScreen() {
  const debts = useFinanceStore((s) => s.debts);
  const addDebt = useFinanceStore((s) => s.addDebt);
  const removeDebt = useFinanceStore((s) => s.removeDebt);

  const [name, setName] = useState('');
  const [remaining, setRemaining] = useState('');
  const [payment, setPayment] = useState('');
  const [rate, setRate] = useState('');

  const handleAdd = () => {
    const remainingAmount = parseFloat(remaining.replace(',', '.'));
    const monthlyPayment = parseFloat(payment.replace(',', '.'));
    const annualInterestRate = parseFloat(rate.replace(',', '.')) || 0;

    if (!name.trim() || !remainingAmount || !monthlyPayment) {
      Alert.alert('Datos incompletos', 'Introduce nombre, importe pendiente y cuota mensual.');
      return;
    }

    addDebt({ name: name.trim(), remainingAmount, monthlyPayment, annualInterestRate });
    setName('');
    setRemaining('');
    setPayment('');
    setRate('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Deudas</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Cuota mensual total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyDebtPayments(debts))}</Text>
        </View>
      </View>

      {debts.length === 0 && <Text style={styles.helperText}>No tienes deudas registradas.</Text>}

      {debts.map((debt, index) => (
        <Animated.View
          key={debt.id}
          entering={FadeInDown.delay(index * 50).duration(280)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{debt.name}</Text>
            <PressableScale onPress={() => removeDebt(debt.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </PressableScale>
          </View>
          <Text style={styles.balance}>{formatCurrency(debt.remainingAmount)}</Text>
          <Text style={styles.helperText}>Pendiente</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Cuota mensual</Text>
              <Text style={styles.metricValue}>{formatCurrency(debt.monthlyPayment)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>TAE</Text>
              <Text style={styles.metricValue}>{debt.annualInterestRate}%</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Interés/mes</Text>
              <Text style={styles.metricValue}>{formatCurrency(debtMonthlyInterestCost(debt))}</Text>
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={styles.newCard}>
        <Text style={styles.sectionHeader}>Añadir deuda</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre (ej: Préstamo coche)"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Importe pendiente (€)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={remaining}
          onChangeText={setRemaining}
        />
        <TextInput
          style={styles.input}
          placeholder="Cuota mensual (€)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={payment}
          onChangeText={setPayment}
        />
        <TextInput
          style={styles.input}
          placeholder="Interés anual / TAE (%)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={rate}
          onChangeText={setRate}
        />
        <PressableScale style={styles.saveButton} onPress={handleAdd}>
          <Text style={styles.saveButtonText}>Añadir deuda</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  screenTitle: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  summaryValue: {
    ...typography.numeric,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  balance: {
    ...typography.numeric,
    color: colors.negative,
    marginTop: spacing.md,
  },
  helperText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    ...typography.micro,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: 2,
  },
  newCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sectionHeader: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveButtonText: {
    ...typography.subtitle,
    color: '#fff',
  },
});
