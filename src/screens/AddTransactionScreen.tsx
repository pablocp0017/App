import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_LABELS,
  ExpenseCategory,
  TransactionType,
} from '../types';
import { todayISODate } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen({ navigation }: Props) {
  const accounts = useFinanceStore((s) => s.accounts);
  const debts = useFinanceStore((s) => s.debts);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [category, setCategory] = useState<ExpenseCategory>('comida');
  const [debtId, setDebtId] = useState<string | undefined>(undefined);

  const spendableAccounts = useMemo(
    () => accounts.filter((a) => a.type === 'cash' || a.type === 'bank'),
    [accounts]
  );

  const handleSave = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Cantidad inválida', 'Introduce una cantidad mayor que 0.');
      return;
    }
    if (!accountId) {
      Alert.alert('Cuenta requerida', 'Selecciona la cuenta afectada (efectivo o banco).');
      return;
    }

    addTransaction({
      type,
      amount: numericAmount,
      date: todayISODate(),
      description: description.trim() || (type === 'income' ? 'Ingreso' : 'Gasto'),
      accountId,
      category: type === 'expense' ? category : undefined,
      debtId: type === 'expense' && category === 'deuda' ? debtId : undefined,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
            onPress={() => setType('expense')}
          >
            <Text
              style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}
            >
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
            onPress={() => setType('income')}
          >
            <Text
              style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}
            >
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Cantidad (€)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.sectionLabel}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Supermercado"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.sectionLabel}>Cuenta afectada</Text>
        <View style={styles.chipRow}>
          {spendableAccounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[styles.chip, accountId === acc.id && styles.chipActive]}
              onPress={() => setAccountId(acc.id)}
            >
              <Ionicons
                name={acc.type === 'cash' ? 'cash-outline' : 'card-outline'}
                size={14}
                color={accountId === acc.id ? '#fff' : colors.textSecondary}
              />
              <Text
                style={[styles.chipText, accountId === acc.id && styles.chipTextActive]}
              >
                {acc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'expense' && (
          <>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <View style={styles.chipRow}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && {
                      backgroundColor: EXPENSE_CATEGORY_COLORS[cat],
                      borderColor: EXPENSE_CATEGORY_COLORS[cat],
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[styles.chipText, category === cat && styles.chipTextActive]}
                  >
                    {EXPENSE_CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {type === 'expense' && category === 'deuda' && (
          <>
            <Text style={styles.sectionLabel}>Deuda asociada</Text>
            {debts.length === 0 ? (
              <Text style={styles.helperText}>
                No tienes deudas registradas. Añade una desde la pantalla de Deudas.
              </Text>
            ) : (
              <View style={styles.chipRow}>
                {debts.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, debtId === d.id && styles.chipActive]}
                    onPress={() => setDebtId(d.id)}
                  >
                    <Text style={[styles.chipText, debtId === d.id && styles.chipTextActive]}>
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActiveExpense: {
    backgroundColor: colors.negative,
    borderColor: colors.negative,
  },
  typeButtonActiveIncome: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 14,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
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
