import { supabase } from "@/lib/supabase";

export interface FactoryTour {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  responsible_id: string | null;
  tour_date: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
}

export type TourInsert = {
  title: string;
  location: string | null;
  description: string | null;
  tour_date: string | null;
  status: string;
  created_by: string;
};

export async function listTours(): Promise<FactoryTour[]> {
  const { data, error } = await supabase
    .from("factory_tours")
    .select("*")
    .order("tour_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FactoryTour[];
}

export async function createTour(input: TourInsert): Promise<void> {
  const { error } = await supabase.from("factory_tours").insert(input);
  if (error) throw error;
}

export async function deleteTour(id: string): Promise<void> {
  const { error } = await supabase.from("factory_tours").delete().eq("id", id);
  if (error) throw error;
}
