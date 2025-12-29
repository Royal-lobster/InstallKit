import { z } from "zod";

export const AppCategoryEnum = z.enum([
  "browsers",
  "development",
  "productivity",
  "communication",
  "media",
  "utilities",
  "security",
  "design",
  "cli",
  "languages",
  "package-managers",
]);

export type AppCategory = z.infer<typeof AppCategoryEnum>;

export const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  brewName: z.string(),
  category: AppCategoryEnum,
  description: z.string(),
  iconUrl: z.string(),
  isCask: z.boolean().optional(),
  invertInDark: z.boolean().optional(),
});

export const CATEGORIES: Array<{ id: AppCategory; label: string }> = [
  { id: AppCategoryEnum.enum.browsers, label: "Browsers" },
  { id: AppCategoryEnum.enum.development, label: "Development" },
  { id: AppCategoryEnum.enum.productivity, label: "Productivity" },
  { id: AppCategoryEnum.enum.communication, label: "Communication" },
  { id: AppCategoryEnum.enum.media, label: "Media" },
  { id: AppCategoryEnum.enum.utilities, label: "Utilities" },
  { id: AppCategoryEnum.enum.security, label: "Security" },
  { id: AppCategoryEnum.enum.design, label: "Design" },
  { id: AppCategoryEnum.enum.cli, label: "CLI Tools" },
  { id: AppCategoryEnum.enum.languages, label: "Languages" },
  { id: AppCategoryEnum.enum["package-managers"], label: "Package Managers" },
];

export type App = z.infer<typeof AppSchema>;
