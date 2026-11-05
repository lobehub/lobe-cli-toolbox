import type { BlogPost, PostSEO } from '@/types/blog';

export interface MergeSeoOptions {
  /** Nest the SEO fields under this frontmatter key instead of the top level. */
  groupKey?: string;
  /** Store `tags` as a comma-separated string. */
  tagStringify?: boolean;
}

/** Merges generated SEO fields into the frontmatter. Fields already in the frontmatter win. */
export const mergeSeoResult = (
  frontmatter: Record<string, any>,
  seo: PostSEO,
  { groupKey, tagStringify }: MergeSeoOptions = {},
): BlogPost => {
  const generated: Record<string, unknown> = { ...seo };
  if (tagStringify && Array.isArray(seo.tags)) generated['tags'] = seo.tags.join(', ');

  if (!groupKey) return { ...generated, ...frontmatter } as BlogPost;
  return {
    ...frontmatter,
    [groupKey]: { ...generated, ...frontmatter[groupKey] },
  } as BlogPost;
};
