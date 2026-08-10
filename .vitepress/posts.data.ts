import { createContentLoader } from 'vitepress'

interface PostMeta {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
  excerpt: string
}

export default createContentLoader(['tech/**/*.md', 'acgn/**/*.md', 'news/**/*.md'], {
  exclude: ['**/index.md'],
  transform(raw): PostMeta[] {
    return raw
      .map(({ url, frontmatter }) => ({
        url,
        category: url.split('/').filter(Boolean)[0] || '',
        title: (frontmatter.title as string) || url,
        date: frontmatter.date ? new Date(String(frontmatter.date)).toISOString() : '',
        tags: (frontmatter.tags as string[]) || [],
        excerpt: (frontmatter.description as string) || (frontmatter.excerpt as string) || '',
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})
