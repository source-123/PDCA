import { supabase } from "@/lib/supabase";

export interface LessonLearned {
  id: string;
  pdca_id: string | null;
  title: string;
  description: string | null;
  problem: string | null;
  cause: string | null;
  solution: string | null;
  result: string | null;
  standardization: string | null;
  created_by: string | null;
  created_at: string;
}

export type LessonInsert = {
  title: string;
  pdca_id: string | null;
  problem: string | null;
  cause: string | null;
  solution: string | null;
  result: string | null;
  standardization: string | null;
  created_by: string;
};

export async function listLessons(): Promise<LessonLearned[]> {
  const { data, error } = await supabase
    .from("lessons_learned")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LessonLearned[];
}

export async function createLesson(input: LessonInsert): Promise<void> {
  const { error } = await supabase.from("lessons_learned").insert({
    ...input,
    description: null,
  });
  if (error) throw error;
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from("lessons_learned").delete().eq("id", id);
  if (error) throw error;
}
