import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import {
  debtMonthlyInterestCost,
  formatCurrency,
  totalMonthlyDebtPayments,
} from '../utils/calculations';

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
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Cuota mensual total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyDebtPayments(debts))}</Text>
        </View>
      </View>

      {debts.length === 0 && (
        <Text style={styles.helperText}>No tienes deudas registradas.</Text>
      )}

      {debts.map((debt) => (
        <View key={debt.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{debt.name}</Text>
            <TouchableOpacity onPress={() => removeDebt(debt.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
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
        </View>
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
        <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
          <Text style={styles.saveButtonText}>Añadir deuda</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  balance: {
    color: colors.negative,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  newCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
