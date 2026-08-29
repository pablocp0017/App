import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

interface Props {
  visible: boolean;
  title: string;
  label?: string;
  initialValue: string;
  keyboardType?: KeyboardTypeOptions;
  onCancel: () => void;
  onSave: (value: string) => void;
}

export default function EditValueModal({
  visible,
  title,
  label,
  initialValue,
  keyboardType = 'decimal-pad',
  onCancel,
  onSave,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Animated.View entering={FadeInDown.duration(220).springify().damping(18)} style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <TextInput
            style={styles.input}
            keyboardType={keyboardType}
            value={value}
            onChangeText={setValue}
            autoFocus
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.actions}>
            <PressableScale style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </PressableScale>
            <PressableScale style={[styles.button, styles.saveButton]} onPress={() => onSave(value)}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </PressableScale>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    ...typography.subtitle,
    color: '#fff',
  },
});
