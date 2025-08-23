export const CHAPTERS = {
  "3_human_growth_and_development": {
    name: "Human Growth and Development",
    color: "bg-blue-500",
  },
  "4_social_and_cultural_diversity": {
    name: "Social and Cultural Diversity",
    color: "bg-green-500",
  },
  "5_counseling_and_helping_relationships": {
    name: "Counseling and Helping Relationships",
    color: "bg-purple-500",
  },
  "6_group_counseling_and_group_work": {
    name: "Group Counseling and Group Work",
    color: "bg-orange-500",
  },
  "7_career_and_development": {
    name: "Career and Development",
    color: "bg-red-500",
  },
  "8_assessment_and_testing": {
    name: "Assessment and Testing",
    color: "bg-yellow-500",
  },
  "9_research_and_program_evaluation": {
    name: "Research and Program Evaluation",
    color: "bg-pink-500",
  },
  "10_professional_orientation_and_ethical_practice": {
    name: "Professional Orientation and Ethical Practice",
    color: "bg-indigo-500",
  },
  "11_counseling_families_diagnosis_and_advanced_concepts": {
    name: "Counseling Families Diagnosis and Advanced Concepts",
    color: "bg-teal-500",
  },
} as const;

export type ChapterKey = keyof typeof CHAPTERS;
