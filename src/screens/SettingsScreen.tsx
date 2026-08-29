import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFinanceStore } from '../store/useFinanceStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import { mockBankSyncProvider } from '../services/bankSync/mockProvider';
import { BankInstitution } from '../services/bankSync/types';
import PressableScale from '../components/PressableScale';

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
      <Text style={styles.screenTitle}>Banco</Text>
      <Text style={styles.sectionHeader}>Conexión bancaria (Open Banking)</Text>
      <Text style={styles.helperText}>
        Conecta tu cuenta bancaria para que tus ingresos y gastos se registren automáticamente
        en el activo y en el saldo del banco, sin tener que introducirlos a mano.
      </Text>

      {bankConnection.connected ? (
        <Animated.View entering={FadeInDown.duration(280)} style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <Ionicons name="checkmark-circle" size={22} color={colors.positive} />
            <Text style={styles.connectedTitle}>{bankConnection.institutionName}</Text>
          </View>
          <Text style={styles.helperText}>
            {bankConnection.lastSyncAt
              ? `Última sincronización: ${new Date(bankConnection.lastSyncAt).toLocaleString('es-ES')}`
              : 'Aún no se ha sincronizado ningún movimiento.'}
          </Text>
          <PressableScale style={styles.primaryButton} onPress={handleSyncNow} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sincronizar ahora</Text>
            )}
          </PressableScale>
          <PressableScale style={styles.secondaryButton} onPress={handleDisconnect}>
            <Text style={styles.secondaryButtonText}>Desconectar banco</Text>
          </PressableScale>
        </Animated.View>
      ) : (
        <View>
          <Text style={styles.subHeader}>Elige tu entidad bancaria</Text>
          {institutions.map((inst, index) => (
            <Animated.View key={inst.id} entering={FadeInDown.delay(index * 50).duration(260)}>
              <PressableScale
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
              </PressableScale>
            </Animated.View>
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
    padding: spacing.lg,
  },
  screenTitle: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  subHeader: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  connectedCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  connectedTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  institutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  institutionName: {
    flex: 1,
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.subtitle,
    color: '#fff',
  },
  secondaryButton: {
    marginTop: spacing.sm,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.subtitle,
    color: colors.negative,
  },
  noteCard: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    ...typography.micro,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
