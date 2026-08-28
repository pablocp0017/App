import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import { mockBankSyncProvider } from '../services/bankSync/mockProvider';
import { BankInstitution } from '../services/bankSync/types';

export default function SettingsScreen() {
  const bankConnection = useFinanceStore((s) => s.bankConnection);
  const connectBank = useFinanceStore((s) => s.connectBank);
  const disconnectBank = useFinanceStore((s) => s.disconnectBank);
  const syncBankTransactions = useFinanceStore((s) => s.syncBankTransactions);

  const [institutions, setInstitutions] = useState<BankInstitution[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    mockBankSyncProvider.listInstitutions().then(setInstitutions);
  }, []);

  const handleConnect = async (institution: BankInstitution) => {
    Alert.alert(
      'Autorizar acceso Open Banking',
      `Vas a autorizar a esta app a leer los movimientos e ingresos/gastos de tu cuenta en ${institution.name}, según la normativa PSD2. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Autorizar',
          onPress: async () => {
            setConnectingId(institution.id);
            try {
              await connectBank(institution.id);
            } finally {
              setConnectingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert('Desconectar banco', 'Dejarás de recibir movimientos automáticos. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desconectar', style: 'destructive', onPress: () => disconnectBank() },
    ]);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const count = await syncBankTransactions();
      Alert.alert(
        'Sincronización completada',
        count > 0
          ? `Se han importado ${count} movimiento(s) nuevo(s) de tu banco.`
          : 'No hay movimientos nuevos por ahora.'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Conexión bancaria (Open Banking)</Text>
      <Text style={styles.helperText}>
        Conecta tu cuenta bancaria para que tus ingresos y gastos se registren automáticamente
        en el activo y en el saldo del banco, sin tener que introducirlos a mano.
      </Text>

      {bankConnection.connected ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <Ionicons name="checkmark-circle" size={22} color={colors.positive} />
            <Text style={styles.connectedTitle}>{bankConnection.institutionName}</Text>
          </View>
          <Text style={styles.helperText}>
            {bankConnection.lastSyncAt
              ? `Última sincronización: ${new Date(bankConnection.lastSyncAt).toLocaleString('es-ES')}`
              : 'Aún no se ha sincronizado ningún movimiento.'}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSyncNow} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sincronizar ahora</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleDisconnect}>
            <Text style={styles.secondaryButtonText}>Desconectar banco</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.subHeader}>Elige tu entidad bancaria</Text>
          {institutions.map((inst) => (
            <TouchableOpacity
              key={inst.id}
              style={styles.institutionRow}
              onPress={() => handleConnect(inst)}
              disabled={connectingId !== null}
            >
              <Ionicons name="business-outline" size={18} color={colors.accent} />
              <Text style={styles.institutionName}>{inst.name}</Text>
              {connectingId === inst.id ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Nota: esta demo simula el flujo de Open Banking (PSD2) sin conectar con un banco
          real. Una integración real requiere un proveedor certificado (ej. Plaid, Tink,
          GoCardless Bank Account Data) y un backend propio que gestione el consentimiento y
          las credenciales de forma segura.
        </Text>
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
    marginTop: 8,
  },
  subHeader: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  connectedCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  connectedTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  institutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  institutionName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
  noteCard: {
    marginTop: 24,
    marginBottom: 30,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
