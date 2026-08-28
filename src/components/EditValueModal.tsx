import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { colors } from '../theme/colors';

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
      <View style={styles.backdrop}>
        <View style={styles.card}>
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
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => onSave(value)}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
