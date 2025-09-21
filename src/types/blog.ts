/**
 * 博客相关类型定义
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

// 文章类型
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: Author
  category: Category
  tags: Tag[]
  publishedAt: string
  updatedAt: string
  readTime: number
  viewCount: number
  likeCount: number
  coverImage?: string
  isPublished: boolean
}

// 作者类型
export interface Author {
  id: string
  name: string
  avatar?: string
  bio?: string
  email?: string
  website?: string
  socialLinks?: SocialLink[]
}

// 分类类型
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  articleCount: number
}

// 标签类型
export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  articleCount: number
}

// 社交链接类型
export interface SocialLink {
  platform: 'github' | 'twitter' | 'linkedin' | 'website'
  url: string
}

// 评论类型
export interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
    email?: string
  }
  articleId: string
  parentId?: string
  createdAt: string
  replies?: Comment[]
}

// 搜索结果类型
export interface SearchResult {
  articles: Article[]
  total: number
  page: number
  pageSize: number
}

// 博客配置类型
export interface BlogConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  author: Author
  socialLinks: SocialLink[]
  articlesPerPage: number
}