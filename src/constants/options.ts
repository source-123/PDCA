import type { Priority, PDCAPhase } from "@/types/database";

export const LINES = [
  "F01","F02","F83","F99","F86","F85","L77","L76","L84","F87","F15","F27",
  "F06","A12","Demag80","Tbillon50T","Demag120T","Engel125T","HUARONG520T",
  "HUARONG420T","Billon550T","boy2","Boy3","Autre",
] as const;
export type LineOption = typeof LINES[number];

export const PILOTS = [
  "Responsable Maintenance","Responsable Mécanique","Responsable HSE",
  "Responsable Qualité","Responsable Logistique","Responsable UAP 1",
  "Responsable UAP 2","Responsable IT","Responsable Sécurité",
  "Responsable ACHAT","Responsable Méthodes","Responsable Finance","Autre",
] as const;

export const DEFECT_TYPES = [
  "Réclamation interne","Non-conformité suite audit","Gemba",
  "Non-conformité suite audit 5S","Réclamation client","Défaut process",
  "Défaut documentaire","Défaut sécurité","Défaut équipement / machine","Autre",
] as const;

export const DEPARTMENTS = [
  "UAP1","UAP2","MAINTENANCE","MECANIQUE","LOGISTIQUE","ACHAT",
  "FINANCE","RH","QUALITÉ","IT","INDUS","MÉTHODE",
] as const;
export type Department = typeof DEPARTMENTS[number];

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "LOW",    label: "Faible" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH",   label: "Élevée" },
];

export const PHASE_TO_PROGRESS: Record<PDCAPhase, number> = {
  P: 25, D: 50, C: 75, A: 100,
};

export const PHASE_LABELS: Record<PDCAPhase, string> = {
  P: "Plan", D: "Do", C: "Check", A: "Act",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "#16a34a", MEDIUM: "#f59e0b", HIGH: "#dc2626",
};
