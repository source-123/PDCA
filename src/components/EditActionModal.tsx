import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { DateField } from "@/components/DateField";
import { PILOTS } from "@/constants/options";
import { theme } from "@/theme";
import type { PDCAActionRow } from "@/types/database";

interface Props {
  visible: boolean;
  action: PDCAActionRow | null;
  onCancel: () => void;
  onSave: (next: { pilot_name: string; due_date: string | null }, comment: string) => Promise<void>;
}

export function EditActionModal({ visible, action, onCancel, onSave }: Props) {
  const [pilot, setPilot] = useState<string>("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local state when modal opens with a new action
  React.useEffect(() => {
    if (visible && action) {
      setPilot(action.pilot_name);
      setDueDate(action.due_date);
      setComment("");
      setError(null);
    }
  }, [visible, action?.id]);

  const submit = async () => {
    setError(null);
    if (!comment.trim()) {
      setError("Un commentaire est requis pour justifier la modification.");
      return;
    }
    if (!pilot.trim()) {
      setError("Le pilote est requis.");
      return;
    }
    try {
      setBusy(true);
      await onSave({ pilot_name: pilot, due_date: dueDate }, comment.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Modifier l'action</Text>
            {action ? (
              <Text style={styles.actionPreview} numberOfLines={2}>
                {action.action}
              </Text>
            ) : null}

            <Text style={styles.hint}>
              Toute modification doit être justifiée. Le commentaire sera ajouté à l'historique.
            </Text>

            <Select
              label="Pilote"
              value={pilot}
              options={PILOTS}
              onChange={setPilot}
              required
            />
            <DateField
              label="Date de fin"
              value={dueDate}
              onChange={setDueDate}
            />
            <Input
              label="Commentaire (raison du changement)"
              value={comment}
              onChangeText={setComment}
              multiline
              required
              placeholder="Ex : pilote absent, réassigné à Qualité"
            />

            {error ? <Text style={styles.err}>{error}</Text> : null}

            <Button label="Enregistrer" onPress={submit} loading={busy} />
            <View style={{ height: 8 }} />
            <Button label="Annuler" variant="secondary" onPress={onCancel} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.55)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.bg,
    maxHeight: "92%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.text, marginBottom: 6 },
  actionPreview: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 12, fontStyle: "italic" },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 16,
  },
  err: { color: theme.colors.danger, fontSize: 13, marginTop: 8, marginBottom: 8, textAlign: "center" },
});
