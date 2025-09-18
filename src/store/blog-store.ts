/**
 * 博客状态管理
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { create } from 'zustand'
import type { Article, Category, Tag, SearchResult } from '@/types/blog'

interface BlogState {
  // 文章相关状态
  articles: Article[]
  currentArticle: Article | null
  featuredArticles: Article[]
  
  // 分类和标签
  categories: Category[]
  tags: Tag[]
  
  // 搜索相关
  searchResults: SearchResult | null
  searchQuery: string
  
  // 加载状态
  isLoading: boolean
  error: string | null
  
  // 分页状态
  currentPage: number
  totalPages: number
  
  // 筛选状态
  selectedCategory: string | null
  selectedTag: string | null
}

interface BlogActions {
  // 文章操作
  setArticles: (articles: Article[]) => void
  setCurrentArticle: (article: Article | null) => void
  setFeaturedArticles: (articles: Article[]) => void
  
  // 分类和标签操作
  setCategories: (categories: Category[]) => void
  setTags: (tags: Tag[]) => void
  
  // 搜索操作
  setSearchResults: (results: SearchResult | null) => void
  setSearchQuery: (query: string) => void
  
  // 状态操作
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 分页操作
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  
  // 筛选操作
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedTag: (tagId: string | null) => void
  
  // 重置操作
  resetFilters: () => void
  resetSearch: () => void
}

export const useBlogStore = create<BlogState & BlogActions>((set) => ({
  // 初始状态
  articles: [],
  currentArticle: null,
  featuredArticles: [],
  categories: [],
  tags: [],
  searchResults: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  selectedCategory: null,
  selectedTag: null,

  // 操作方法
  setArticles: (articles) => set({ articles }),
  setCurrentArticle: (article) => set({ currentArticle: article }),
  setFeaturedArticles: (articles) => set({ featuredArticles: articles }),
  
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSelectedTag: (tagId) => set({ selectedTag: tagId }),
  
  resetFilters: () => set({ 
    selectedCategory: null, 
    selectedTag: null,
    currentPage: 1 
  }),
  
  resetSearch: () => set({ 
    searchResults: null, 
    searchQuery: '',
    currentPage: 1 
  }),
}))