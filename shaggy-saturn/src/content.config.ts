/**
 * Content Collections: схема постов блога.
 * В Astro 6 конфиг живёт в src/content.config.ts (не src/content/config.ts),
 * а defineCollection импортируется из astro/content/config (не astro:content).
 */
import { defineCollection } from "astro/content/config";
import { glob } from "astro/loaders";
import { z } from "zod";

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
    // draft: true — пост не попадает в блог, главную, теги и RSS
    // (фильтруется на каждом getCollection, единого места нет)
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
};
