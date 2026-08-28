import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import { formatCurrency, investmentMonthlyReturn, investmentAnnualReturn } from '../utils/calculations';
import { AssetAccount, AssetAccountType } from '../types';
import EditValueModal from '../components/EditValueModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Accounts'>;

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

export default function AccountsScreen({ navigation }: Props) {
  const accounts = useFinanceStore((s) => s.accounts);
  const updateAccount = useFinanceStore((s) => s.updateAccount);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const removeAccount = useFinanceStore((s) => s.removeAccount);
  const bankConnection = useFinanceStore((s) => s.bankConnection);

  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newRate, setNewRate] = useState('');

  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);

  const handleAddAccount = () => {
    const balance = parseFloat(newBalance.replace(',', '.')) || 0;
    const rate = parseFloat(newRate.replace(',', '.')) || 0;
    if (!newName.trim()) {
      Alert.alert('Nombre requerido', 'Ponle un nombre a la inversión.');
      return;
    }
    addAccount({
      type: 'investment',
      name: newName.trim(),
      balance,
      annualInterestRate: rate,
    });
    setNewName('');
    setNewBalance('');
    setNewRate('');
  };

  const handleRemove = (account: AssetAccount) => {
    Alert.alert('Eliminar cuenta', `¿Seguro que quieres eliminar "${account.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeAccount(account.id) },
    ]);
  };

  const editingAccount = accounts.find((a) => a.id === editingBalanceId) ?? null;

  const renderAccount = (account: AssetAccount) => (
    <View key={account.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name={TYPE_ICON[account.type]} size={18} color={colors.accent} />
          <Text style={styles.cardTitle}>{account.name}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => setEditingBalanceId(account.id)} hitSlop={10}>
            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {!account.protected && (
            <TouchableOpacity onPress={() => handleRemove(account)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
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
        <TouchableOpacity
          style={styles.bankStatusRow}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons
            name={bankConnection.connected ? 'checkmark-circle' : 'alert-circle-outline'}
            size={14}
            color={bankConnection.connected ? colors.positive : colors.textSecondary}
          />
          <Text style={styles.helperText}>
            {bankConnection.connected
              ? `Sincronizado automáticamente con ${bankConnection.institutionName} (Open Banking)`
              : 'Conecta tu banco por Open Banking para automatizar tus movimientos'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.sectionHeader}>Efectivo y banco</Text>
      <Text style={styles.helperText}>
        Toca el lápiz para ajustar el saldo manualmente (por ejemplo, para introducir el
        efectivo que tienes ahora mismo).
      </Text>
      {accounts.filter((a) => a.type !== 'investment').map(renderAccount)}

      <Text style={styles.sectionHeader}>Inversiones</Text>
      {accounts.filter((a) => a.type === 'investment').length === 0 && (
        <Text style={styles.helperText}>Aún no tienes inversiones registradas.</Text>
      )}
      {accounts.filter((a) => a.type === 'investment').map(renderAccount)}

      <View style={styles.newCard}>
        <Text style={styles.sectionHeader}>Añadir inversión</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Interés anual estimado (%)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={newRate}
          onChangeText={setNewRate}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleAddAccount}>
          <Text style={styles.saveButtonText}>Añadir inversión</Text>
        </TouchableOpacity>
      </View>

      <EditValueModal
        visible={!!editingAccount}
        title={`Ajustar saldo de ${editingAccount?.name ?? ''}`}
        label="Nuevo saldo (€)"
        initialValue={editingAccount ? String(editingAccount.balance) : '0'}
        keyboardType="decimal-pad"
        onCancel={() => setEditingBalanceId(null)}
        onSave={(value) => {
          const balance = parseFloat(value.replace(',', '.'));
          if (editingAccount && Number.isFinite(balance)) {
            updateAccount(editingAccount.id, { balance });
          }
          setEditingBalanceId(null);
        }}
      />
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
  cardActions: {
    flexDirection: 'row',
    gap: 14,
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
  bankStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    flexShrink: 1,
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
