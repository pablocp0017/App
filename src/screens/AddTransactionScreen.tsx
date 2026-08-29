import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_LABELS,
  ExpenseCategory,
  TransactionType,
} from '../types';
import { todayISODate } from '../utils/dateUtils';
import PressableScale from '../components/PressableScale';

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
          <PressableScale
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
            onPress={() => setType('expense')}
            haptic={false}
          >
            <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
              Gasto
            </Text>
          </PressableScale>
          <PressableScale
            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
            onPress={() => setType('income')}
            haptic={false}
          >
            <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
              Ingreso
            </Text>
          </PressableScale>
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
            <PressableScale
              key={acc.id}
              style={[styles.chip, accountId === acc.id && styles.chipActive]}
              onPress={() => setAccountId(acc.id)}
              haptic={false}
            >
              <Ionicons
                name={acc.type === 'cash' ? 'cash-outline' : 'card-outline'}
                size={14}
                color={accountId === acc.id ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.chipText, accountId === acc.id && styles.chipTextActive]}>
                {acc.name}
              </Text>
            </PressableScale>
          ))}
        </View>

        {type === 'expense' && (
          <>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <View style={styles.chipRow}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <PressableScale
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && {
                      backgroundColor: EXPENSE_CATEGORY_COLORS[cat],
                      borderColor: EXPENSE_CATEGORY_COLORS[cat],
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                  haptic={false}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {EXPENSE_CATEGORY_LABELS[cat]}
                  </Text>
                </PressableScale>
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
                  <PressableScale
                    key={d.id}
                    style={[styles.chip, debtId === d.id && styles.chipActive]}
                    onPress={() => setDebtId(d.id)}
                    haptic={false}
                  >
                    <Text style={[styles.chipText, debtId === d.id && styles.chipTextActive]}>
                      {d.name}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            )}
          </>
        )}

        <PressableScale style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
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
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'none',
  },
  chipTextActive: {
    color: '#fff',
  },
  helperText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: spacing.xxl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.title,
    color: '#fff',
  },
});
