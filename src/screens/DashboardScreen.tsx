import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFinanceStore } from '../store/useFinanceStore';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import ExpensePieChart from '../components/ExpensePieChart';
import Fab from '../components/Fab';
import EditValueModal from '../components/EditValueModal';
import { colors } from '../theme/colors';
import { currentMonthKey, shiftMonthKey } from '../utils/dateUtils';

const AUTO_SYNC_INTERVAL_MS = 45000;
import {
  emergencyFundTarget,
  expensesByCategory,
  formatCurrency,
  monthlyExpenses,
  monthlyIncome,
  totalAssets,
  totalDebts,
  totalLiabilities,
} from '../utils/calculations';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const accounts = useFinanceStore((s) => s.accounts);
  const debts = useFinanceStore((s) => s.debts);
  const transactions = useFinanceStore((s) => s.transactions);
  const settings = useFinanceStore((s) => s.settings);
  const bankConnection = useFinanceStore((s) => s.bankConnection);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const syncBankTransactions = useFinanceStore((s) => s.syncBankTransactions);

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const isCurrentMonth = monthKey === currentMonthKey();

  const [editingEmergencyMonths, setEditingEmergencyMonths] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);

  // Simula la llegada de movimientos en tiempo real vía Open Banking mientras el banco
  // esté conectado (sustituye a un webhook real del proveedor Open Banking).
  useEffect(() => {
    if (!bankConnection.connected) return;
    const interval = setInterval(() => {
      syncBankTransactions();
    }, AUTO_SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [bankConnection.connected, syncBankTransactions]);

  const assets = useMemo(() => totalAssets(accounts), [accounts]);
  const income = useMemo(() => monthlyIncome(transactions, monthKey), [transactions, monthKey]);
  const expenses = useMemo(() => monthlyExpenses(transactions, monthKey), [transactions, monthKey]);
  const currentMonthExpenses = useMemo(
    () => monthlyExpenses(transactions, currentMonthKey()),
    [transactions]
  );
  const liabilities = useMemo(
    () => totalLiabilities(debts, isCurrentMonth ? expenses : currentMonthExpenses),
    [debts, expenses, isCurrentMonth, currentMonthExpenses]
  );
  const emergencyTarget = useMemo(
    () => emergencyFundTarget(currentMonthExpenses, settings.emergencyFundMonths),
    [currentMonthExpenses, settings.emergencyFundMonths]
  );
  const categoryTotals = useMemo(() => expensesByCategory(transactions, monthKey), [transactions, monthKey]);

  const liquid = accounts
    .filter((a) => a.type === 'cash' || a.type === 'bank')
    .reduce((sum, a) => sum + a.balance, 0);
  const emergencyCoveragePct = emergencyTarget > 0 ? Math.min(100, (liquid / emergencyTarget) * 100) : 0;

  const expenseLimit = settings.monthlyExpenseLimit;
  const expensePct = expenseLimit > 0 ? Math.min(100, (expenses / expenseLimit) * 100) : 0;
  const overLimit = expenseLimit > 0 && expenses > expenseLimit;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis finanzas</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Accounts')} style={styles.iconButton}>
              <Ionicons name="wallet-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Debts')} style={styles.iconButton}>
              <Ionicons name="document-text-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
              <Ionicons
                name={bankConnection.connected ? 'sync-circle-outline' : 'link-outline'}
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Activo total y 2. Pasivo total */}
        <View style={styles.row}>
          <SummaryCard label="Activo total" value={formatCurrency(assets)} valueColor={colors.positive} />
          <SummaryCard label="Pasivo total" value={formatCurrency(liabilities)} valueColor={colors.negative} />
        </View>

        {/* 3. Fondo de emergencia */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeaderRow}>
            <Text style={styles.cardLabel}>
              Fondo de emergencia ({settings.emergencyFundMonths} {settings.emergencyFundMonths === 1 ? 'mes' : 'meses'})
            </Text>
            <View style={styles.headerRightGroup}>
              <Text style={styles.cardLabel}>{Math.round(emergencyCoveragePct)}%</Text>
              <TouchableOpacity onPress={() => setEditingEmergencyMonths(true)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.emergencyValue}>{formatCurrency(emergencyTarget)}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${emergencyCoveragePct}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>
          <Text style={styles.helperText}>
            Disponible en efectivo y banco: {formatCurrency(liquid)}
          </Text>
        </View>

        {/* 4. Mes actual */}
        <MonthSelector
          monthKey={monthKey}
          onPrev={() => setMonthKey((m) => shiftMonthKey(m, -1))}
          onNext={() => setMonthKey((m) => shiftMonthKey(m, 1))}
          disableNext={isCurrentMonth}
        />

        {/* 5. Ingresos y 6. Gastos del mes */}
        <View style={styles.row}>
          <SummaryCard label="Ingresos del mes" value={formatCurrency(income)} valueColor={colors.positive} />
          <SummaryCard label="Gastos del mes" value={formatCurrency(expenses)} valueColor={colors.negative} />
        </View>

        {/* 7. Límite mensual de gastos */}
        <View style={styles.limitCard}>
          <View style={styles.emergencyHeaderRow}>
            <Text style={styles.cardLabel}>Límite mensual de gastos</Text>
            <View style={styles.headerRightGroup}>
              <Text style={[styles.cardLabel, overLimit && { color: colors.negative }]}>
                {expenseLimit > 0 ? `${Math.round(expensePct)}%` : 'Sin definir'}
              </Text>
              <TouchableOpacity onPress={() => setEditingLimit(true)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.limitValue}>
            {formatCurrency(expenses)} / {expenseLimit > 0 ? formatCurrency(expenseLimit) : '—'}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${expenseLimit > 0 ? expensePct : 0}%`,
                  backgroundColor: overLimit ? colors.negative : colors.positive,
                },
              ]}
            />
          </View>
          {expenseLimit === 0 && (
            <Text style={styles.helperText}>
              Toca el lápiz para definir tu límite mensual y hacer seguimiento.
            </Text>
          )}
        </View>

        {/* 8. Gráfico circular de gastos */}
        <View style={styles.chartCard}>
          <Text style={styles.cardLabel}>Gastos por categoría</Text>
          <View style={{ marginTop: 12 }}>
            <ExpensePieChart data={categoryTotals} />
          </View>
        </View>

        <View style={styles.debtSummaryCard}>
          <Text style={styles.cardLabel}>Deudas pendientes</Text>
          <Text style={styles.limitValue}>{formatCurrency(totalDebts(debts))}</Text>
        </View>
      </ScrollView>

      {/* 9. Botón flotante para registrar ingresos/gastos */}
      <Fab onPress={() => navigation.navigate('AddTransaction')} />

      <EditValueModal
        visible={editingEmergencyMonths}
        title="Fondo de emergencia"
        label="Meses de gastos que quieres tener cubiertos"
        initialValue={String(settings.emergencyFundMonths)}
        keyboardType="number-pad"
        onCancel={() => setEditingEmergencyMonths(false)}
        onSave={(value) => {
          const months = parseInt(value, 10);
          if (Number.isFinite(months) && months > 0) {
            updateSettings({ emergencyFundMonths: months });
          }
          setEditingEmergencyMonths(false);
        }}
      />

      <EditValueModal
        visible={editingLimit}
        title="Límite mensual de gastos"
        label="Cantidad máxima que quieres gastar cada mes (€)"
        initialValue={String(settings.monthlyExpenseLimit)}
        keyboardType="decimal-pad"
        onCancel={() => setEditingLimit(false)}
        onSave={(value) => {
          const limit = parseFloat(value.replace(',', '.'));
          if (Number.isFinite(limit) && limit >= 0) {
            updateSettings({ monthlyExpenseLimit: limit });
          }
          setEditingLimit(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 14,
  },
  iconButton: {
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  emergencyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emergencyValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 8,
  },
  limitCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debtSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
