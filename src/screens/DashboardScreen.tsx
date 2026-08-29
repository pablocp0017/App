import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useFinanceStore } from '../store/useFinanceStore';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import ExpensePieChart from '../components/ExpensePieChart';
import Fab from '../components/Fab';
import EditValueModal from '../components/EditValueModal';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import PressableScale from '../components/PressableScale';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import { currentMonthKey, shiftMonthKey } from '../utils/dateUtils';
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

const AUTO_SYNC_INTERVAL_MS = 45000;

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

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
  const netWorth = assets - liabilities;

  const expenseLimit = settings.monthlyExpenseLimit;
  const expensePct = expenseLimit > 0 ? Math.min(100, (expenses / expenseLimit) * 100) : 0;
  const overLimit = expenseLimit > 0 && expenses > expenseLimit;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con patrimonio neto: 1. Activo total y 2. Pasivo total */}
        <Animated.View entering={FadeInDown.duration(320)}>
          <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Patrimonio neto</Text>
            <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(netWorth)}
            </Text>
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Ionicons name="trending-up" size={14} color={colors.positive} />
                <Text style={styles.heroStatLabel}>Activo</Text>
                <Text style={[styles.heroStatValue, { color: colors.positive }]}>
                  {formatCurrency(assets)}
                </Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Ionicons name="trending-down" size={14} color={colors.negative} />
                <Text style={styles.heroStatLabel}>Pasivo</Text>
                <Text style={[styles.heroStatValue, { color: colors.negative }]}>
                  {formatCurrency(liabilities)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 3. Fondo de emergencia */}
        <Animated.View entering={FadeInDown.delay(60).duration(320)} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>
              Fondo de emergencia · {settings.emergencyFundMonths}{' '}
              {settings.emergencyFundMonths === 1 ? 'mes' : 'meses'}
            </Text>
            <View style={styles.headerRightGroup}>
              <Text style={styles.cardLabel}>{Math.round(emergencyCoveragePct)}%</Text>
              <PressableScale onPress={() => setEditingEmergencyMonths(true)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              </PressableScale>
            </View>
          </View>
          <Text style={styles.cardValue}>{formatCurrency(emergencyTarget)}</Text>
          <View style={{ marginTop: spacing.md }}>
            <AnimatedProgressBar progress={emergencyCoveragePct} color={colors.accent} />
          </View>
          <Text style={styles.helperText}>Disponible en efectivo y banco: {formatCurrency(liquid)}</Text>
        </Animated.View>

        {/* 4. Mes actual */}
        <MonthSelector
          monthKey={monthKey}
          onPrev={() => setMonthKey((m) => shiftMonthKey(m, -1))}
          onNext={() => setMonthKey((m) => shiftMonthKey(m, 1))}
          disableNext={isCurrentMonth}
        />

        {/* 5. Ingresos y 6. Gastos del mes */}
        <Animated.View entering={FadeInDown.delay(100).duration(320)} style={styles.row}>
          <SummaryCard
            label="Ingresos"
            value={formatCurrency(income)}
            valueColor={colors.positive}
            icon="arrow-down-circle"
            iconColor={colors.positive}
          />
          <SummaryCard
            label="Gastos"
            value={formatCurrency(expenses)}
            valueColor={colors.negative}
            icon="arrow-up-circle"
            iconColor={colors.negative}
          />
        </Animated.View>

        {/* 7. Límite mensual de gastos */}
        <Animated.View entering={FadeInDown.delay(140).duration(320)} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>Límite mensual de gastos</Text>
            <View style={styles.headerRightGroup}>
              <Text style={[styles.cardLabel, overLimit && { color: colors.negative }]}>
                {expenseLimit > 0 ? `${Math.round(expensePct)}%` : 'Sin definir'}
              </Text>
              <PressableScale onPress={() => setEditingLimit(true)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              </PressableScale>
            </View>
          </View>
          <Text style={styles.cardValue}>
            {formatCurrency(expenses)}{' '}
            <Text style={styles.cardValueMuted}>
              / {expenseLimit > 0 ? formatCurrency(expenseLimit) : '—'}
            </Text>
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <AnimatedProgressBar
              progress={expenseLimit > 0 ? expensePct : 0}
              color={overLimit ? colors.negative : colors.positive}
            />
          </View>
          {expenseLimit === 0 && (
            <Text style={styles.helperText}>
              Toca el lápiz para definir tu límite mensual y hacer seguimiento.
            </Text>
          )}
        </Animated.View>

        {/* 8. Gráfico circular de gastos */}
        <Animated.View entering={FadeInDown.delay(180).duration(320)} style={styles.card}>
          <Text style={styles.cardLabel}>Gastos por categoría</Text>
          <View style={{ marginTop: spacing.md }}>
            <ExpensePieChart data={categoryTotals} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(320)} style={styles.card}>
          <Text style={styles.cardLabel}>Deudas pendientes</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalDebts(debts))}</Text>
        </Animated.View>
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
    paddingHorizontal: spacing.lg,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  heroLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  heroValue: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroStatValue: {
    ...typography.subtitle,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderStrong,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  cardValue: {
    ...typography.numeric,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  cardValueMuted: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  helperText: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
