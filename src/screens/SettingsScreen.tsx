import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const [months, setMonths] = useState(String(settings.emergencyFundMonths));
  const [limit, setLimit] = useState(String(settings.monthlyExpenseLimit));

  const handleSave = () => {
    const monthsValue = parseInt(months, 10);
    const limitValue = parseFloat(limit.replace(',', '.'));
    updateSettings({
      emergencyFundMonths: Number.isFinite(monthsValue) && monthsValue > 0 ? monthsValue : settings.emergencyFundMonths,
      monthlyExpenseLimit: Number.isFinite(limitValue) && limitValue >= 0 ? limitValue : settings.monthlyExpenseLimit,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Fondo de emergencia</Text>
      <Text style={styles.helperText}>
        Número de meses de gastos que quieres tener siempre disponibles como colchón.
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={months}
        onChangeText={setMonths}
        placeholder="3"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.sectionHeader}>Límite de gasto mensual</Text>
      <Text style={styles.helperText}>
        Cantidad máxima que quieres gastar cada mes. Se usará para avisarte cuando te acerques
        al límite.
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={limit}
        onChangeText={setLimit}
        placeholder="0"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar ajustes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
