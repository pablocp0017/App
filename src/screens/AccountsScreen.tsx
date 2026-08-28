import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import { formatCurrency, investmentMonthlyReturn, investmentAnnualReturn } from '../utils/calculations';
import { AssetAccount, AssetAccountType } from '../types';

const TYPE_LABEL: Record<AssetAccountType, string> = {
  cash: 'Efectivo',
  bank: 'Banco',
  investment: 'Inversión',
};

const TYPE_ICON: Record<AssetAccountType, keyof typeof Ionicons.glyphMap> = {
  cash: 'cash-outline',
  bank: 'card-outline',
  investment: 'trending-up-outline',
};

export default function AccountsScreen() {
  const accounts = useFinanceStore((s) => s.accounts);
  const updateAccount = useFinanceStore((s) => s.updateAccount);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const removeAccount = useFinanceStore((s) => s.removeAccount);
  const applyAutomaticBankMovement = useFinanceStore((s) => s.applyAutomaticBankMovement);

  const [newAccountType, setNewAccountType] = useState<AssetAccountType>('investment');
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newRate, setNewRate] = useState('');

  const [bankMovementAmount, setBankMovementAmount] = useState('');
  const [activeBankId, setActiveBankId] = useState<string | null>(null);

  const handleAddAccount = () => {
    const balance = parseFloat(newBalance.replace(',', '.')) || 0;
    const rate = parseFloat(newRate.replace(',', '.')) || 0;
    if (!newName.trim()) {
      Alert.alert('Nombre requerido', 'Ponle un nombre a la cuenta.');
      return;
    }
    addAccount({
      type: newAccountType,
      name: newName.trim(),
      balance,
      annualInterestRate: newAccountType === 'investment' ? rate : undefined,
    });
    setNewName('');
    setNewBalance('');
    setNewRate('');
  };

  const handleAutoMovement = (accountId: string, isIncrease: boolean) => {
    const amount = parseFloat(bankMovementAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert('Cantidad inválida', 'Introduce la cantidad reportada por el banco.');
      return;
    }
    applyAutomaticBankMovement({
      accountId,
      amount,
      type: isIncrease ? 'income' : 'expense',
      description: isIncrease ? 'Movimiento bancario automático (ingreso)' : 'Movimiento bancario automático (cargo)',
    });
    setBankMovementAmount('');
    setActiveBankId(null);
  };

  const renderAccount = (account: AssetAccount) => (
    <View key={account.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name={TYPE_ICON[account.type]} size={18} color={colors.accent} />
          <Text style={styles.cardTitle}>{account.name}</Text>
        </View>
        <TouchableOpacity onPress={() => removeAccount(account.id)} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
      <Text style={styles.typeTag}>{TYPE_LABEL[account.type]}</Text>

      {account.type === 'investment' && (
        <View style={styles.investmentInfo}>
          <Text style={styles.helperText}>
            Interés anual: {account.annualInterestRate ?? 0}%
          </Text>
          <Text style={styles.helperText}>
            Rendimiento estimado: {formatCurrency(investmentAnnualReturn(account))}/año ·{' '}
            {formatCurrency(investmentMonthlyReturn(account))}/mes
          </Text>
        </View>
      )}

      {account.type === 'bank' && (
        <View style={styles.autoSyncSection}>
          <View style={styles.autoSyncRow}>
            <Text style={styles.helperText}>Actualización automática</Text>
            <Switch
              value={!!account.autoSyncEnabled}
              onValueChange={(value) => updateAccount(account.id, { autoSyncEnabled: value })}
              trackColor={{ true: colors.accent, false: colors.border }}
            />
          </View>
          {account.autoSyncEnabled && (
            <View>
              <Text style={styles.helperText}>
                Registra aquí el movimiento que reporte tu banco y se reflejará automáticamente
                en el activo.
              </Text>
              {activeBankId === account.id ? (
                <View style={styles.autoMovementForm}>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="decimal-pad"
                    placeholder="Cantidad €"
                    placeholderTextColor={colors.textSecondary}
                    value={bankMovementAmount}
                    onChangeText={setBankMovementAmount}
                  />
                  <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: colors.positive }]}
                    onPress={() => handleAutoMovement(account.id, true)}
                  >
                    <Text style={styles.smallButtonText}>+ Ingreso</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: colors.negative }]}
                    onPress={() => handleAutoMovement(account.id, false)}
                  >
                    <Text style={styles.smallButtonText}>- Cargo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setActiveBankId(account.id)}
                >
                  <Text style={styles.linkButtonText}>Registrar movimiento del banco</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.sectionHeader}>Efectivo y banco</Text>
      {accounts.filter((a) => a.type !== 'investment').map(renderAccount)}

      <Text style={styles.sectionHeader}>Inversiones</Text>
      {accounts.filter((a) => a.type === 'investment').length === 0 && (
        <Text style={styles.helperText}>Aún no tienes inversiones registradas.</Text>
      )}
      {accounts.filter((a) => a.type === 'investment').map(renderAccount)}

      <View style={styles.newCard}>
        <Text style={styles.sectionHeader}>Añadir cuenta</Text>
        <View style={styles.chipRow}>
          {(['cash', 'bank', 'investment'] as AssetAccountType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, newAccountType === t && styles.chipActive]}
              onPress={() => setNewAccountType(t)}
            >
              <Text style={[styles.chipText, newAccountType === t && styles.chipTextActive]}>
                {TYPE_LABEL[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nombre (ej: Fondo indexado)"
          placeholderTextColor={colors.textSecondary}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Saldo inicial (€)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={newBalance}
          onChangeText={setNewBalance}
        />
        {newAccountType === 'investment' && (
          <TextInput
            style={styles.input}
            placeholder="Interés anual estimado (%)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={newRate}
            onChangeText={setNewRate}
          />
        )}
        <TouchableOpacity style={styles.saveButton} onPress={handleAddAccount}>
          <Text style={styles.saveButtonText}>Añadir cuenta</Text>
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
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  balance: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  typeTag: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  investmentInfo: {
    marginTop: 10,
    gap: 2,
  },
  autoSyncSection: {
    marginTop: 10,
    gap: 8,
  },
  autoSyncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  autoMovementForm: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  smallInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    minWidth: 90,
  },
  smallButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  linkButton: {
    marginTop: 4,
  },
  linkButtonText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 13,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
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
