/** Слаг тега для URL: «learning in public» → «learning-in-public». Кириллица сохраняется. */
export function slugifyTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}
