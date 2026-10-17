export const exhibition = {
  title: "Moments of K",
  subtitle: "A Birthday Photo Exhibition",
  date: "21 October 2026",
  dedication: "For all the light you bring, and all the moments still to come.",
};
export type ChapterId = "spotlight" | "closer" | "between" | "colors";
export type Chapter = {
  id: ChapterId;
  index: number;
  title: string;
  subtitle: string;
  theme: "light" | "dark";
};
export const chapters: Chapter[] = [
  {
    id: "spotlight",
    index: 1,
    title: "In the Spotlight",
    subtitle: "When the lights find you, the world falls quiet.",
    theme: "dark",
  },
  {
    id: "closer",
    index: 2,
    title: "A Little Closer",
    subtitle: "Beyond the stage. A glance, a smile, a moment of connection.",
    theme: "light",
  },
  {
    id: "between",
    index: 3,
    title: "In Between",
    subtitle: "The unguarded seconds. The beautiful, ordinary things.",
    theme: "light",
  },
  {
    id: "colors",
    index: 4,
    title: "All the Colors of You",
    subtitle: "Never just one shade. Always, entirely you.",
    theme: "light",
  },
];
