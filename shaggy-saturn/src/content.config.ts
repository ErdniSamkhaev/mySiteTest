/**
 * Конфиги для постов
 */

// кароче из-за 6 версии astro, нужно создать этот файл и настроить content collections, не в src/content/config.ts
// импорттируем defineCollection из astro
import { defineCollection } from "astro/content/config";
// Импортируем glob
import { glob } from "astro/loaders";
// импортиоуем zod
import { z } from "zod";

// определяем коллекцию posts
const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
        variant: z.enum(["default", "round"]).default("default"),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
};
