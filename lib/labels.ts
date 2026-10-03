export const JOB_TYPE_LABEL = {
  full_time: "Full time",
  part_time: "Part time",
  magang: "Magang",
  kontrak: "Kontrak",
  freelance: "Freelance",
} as const;

export type JobType = keyof typeof JOB_TYPE_LABEL;

export const WORK_MODE_LABEL = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
} as const;

export type WorkMode = keyof typeof WORK_MODE_LABEL;

export const EDUCATION_LABEL = {
  tanpa_syarat: "Tanpa syarat",
  sma_smk: "SMA/SMK",
  d3: "D3",
  s1: "S1",
  s2: "S2",
} as const;

export type EducationMin = keyof typeof EDUCATION_LABEL;
