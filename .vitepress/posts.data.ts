import { createContentLoader } from 'vitepress'

interface PostMeta {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
  excerpt: string
}

export default createContentLoader(
  [
    'Tech/**/*.md',
    'Product/**/*.md',
    'ACGN/**/*.md',
    'Project/**/*.md',
    'Growth/**/*.md',
    'English/**/*.md',
    'Me/**/*.md',
    'news/**/*.md',
  ],
  {
    exclude: ['**/index.md'],
    transform(raw): PostMeta[] {
      return raw
        .map(({ url, frontmatter }) => ({
          url,
          // URL 首段即分类（如 /Tech/xxx → tech），统一小写便于分组
          category: (url.split('/').filter(Boolean)[0] || '').toLowerCase(),
          title: (frontmatter.title as string) || url,
          date: frontmatter.date ? new Date(String(frontmatter.date)).toISOString() : '',
          tags: (frontmatter.tags as string[]) || [],
          excerpt: (frontmatter.description as string) || (frontmatter.excerpt as string) || '',
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    },
  },
)
