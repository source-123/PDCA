import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { theme } from "@/theme";

interface Props {
  visible: boolean;
  actionLabel: string;
  onCancel: () => void;
  onJustClose: (comment: string) => Promise<void>;
  onCloseWithLesson: (comment: string) => Promise<void>;
}

export function PhaseCompleteModal({
  visible,
  actionLabel,
  onCancel,
  onJustClose,
  onCloseWithLesson,
}: Props) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setComment("");
      setError(null);
    }
  }, [visible]);

  const submit = async (withLesson: boolean) => {
    setError(null);
    if (!comment.trim()) {
      setError("Un commentaire est requis pour clôturer l'action.");
      return;
    }
    try {
      setBusy(true);
      if (withLesson) await onCloseWithLesson(comment.trim());
      else await onJustClose(comment.trim());
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
            <Text style={styles.title}>Action terminée (100 %)</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {actionLabel}
            </Text>

            <Text style={styles.hint}>
              Vous avez atteint la phase A. Que voulez-vous faire ?
            </Text>

            <Input
              label="Commentaire de clôture (requis)"
              value={comment}
              onChangeText={setComment}
              multiline
              placeholder="Ex : Cause racine traitée, résultats conformes"
              required
            />

            {error ? <Text style={styles.err}>{error}</Text> : null}

            <Button
              label="Clôturer + Leçon apprise"
              onPress={() => submit(true)}
              loading={busy}
            />
            <View style={{ height: 8 }} />
            <Button
              label="Juste clôturer"
              variant="secondary"
              onPress={() => submit(false)}
              loading={busy}
            />
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
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, fontStyle: "italic" },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  err: { color: theme.colors.danger, fontSize: 13, marginTop: 8, marginBottom: 8, textAlign: "center" },
});
