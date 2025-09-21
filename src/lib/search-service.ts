/**
 * 文章搜索服务
 * 
 * @author xxh
 * @date 2025-09-21
 */

import type { Article } from '@/types/blog'
import { loadAllPosts } from './simple-post-loader'

export interface SearchResultArticle extends Article {
  contextSnippets?: string[]
  relevanceScore?: number
}

export interface SearchResult {
  articles: SearchResultArticle[]
  total: number
  query: string
  searchTime: number
}

export interface SearchOptions {
  query: string
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'popularity'
  filterBy?: 'all' | 'title' | 'content' | 'tags' | 'category'
}

/**
 * 计算文本相似度分数
 */
function calculateRelevanceScore(text: string, query: string): number {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  let score = 0
  
  // 完全匹配得分最高
  if (lowerText.includes(lowerQuery)) {
    score += 100
    
    // 如果是开头匹配，额外加分
    if (lowerText.startsWith(lowerQuery)) {
      score += 50
    }
  }
  
  // 分词匹配
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0)
  const textWords = lowerText.split(/\s+/)
  
  let matchedWords = 0
  for (const queryWord of queryWords) {
    let wordMatched = false
    for (const textWord of textWords) {
      if (textWord.includes(queryWord)) {
        score += 10
        wordMatched = true
      }
      if (textWord === queryWord) {
        score += 20
        wordMatched = true
      }
    }
    if (wordMatched) {
      matchedWords++
    }
  }
  
  // 只有当匹配的词数达到一定比例时才给予额外分数
  const matchRatio = matchedWords / queryWords.length
  if (matchRatio >= 0.5) {
    score += matchRatio * 20
  }
  
  return score
}

/**
 * 搜索文章
 */
export async function searchArticles(options: SearchOptions): Promise<SearchResult> {
  const startTime = Date.now()
  
  try {
    const allArticles = await loadAllPosts()
    const { query = '', limit = 20, offset = 0, sortBy = 'relevance', filterBy = 'all' } = options
    
    if (!query.trim()) {
      return {
        articles: [],
        total: 0,
        query: query,
        searchTime: Date.now() - startTime
      }
    }
    
    // 过滤和评分
    const scoredArticles = allArticles
      .filter(article => article.isPublished)
      .map(article => {
        let totalScore = 0
        
        // 根据搜索范围计算分数
        switch (filterBy) {
          case 'title':
            totalScore = calculateRelevanceScore(article.title, query)
            break
          case 'content':
            totalScore = calculateRelevanceScore(article.content, query)
            break
          case 'tags':
            totalScore = article.tags.reduce((score, tag) => 
              score + calculateRelevanceScore(tag.name, query), 0)
            break
          case 'category':
            totalScore = calculateRelevanceScore(article.category.name, query)
            break
          case 'all':
          default:
            // 标题权重最高
            totalScore += calculateRelevanceScore(article.title, query) * 3
            // 摘要权重中等
            totalScore += calculateRelevanceScore(article.excerpt, query) * 2
            // 内容权重较低
            totalScore += calculateRelevanceScore(article.content, query) * 0.5
            // 标签权重中等
            totalScore += article.tags.reduce((score, tag) => 
              score + calculateRelevanceScore(tag.name, query), 0) * 2
            // 分类权重中等
            totalScore += calculateRelevanceScore(article.category.name, query) * 2
            break
        }
        
        return {
          article,
          score: totalScore
        }
      })
      .filter(item => item.score >= 10) // 只保留真正匹配的文章，提高最低分数要求
    
    // 排序
    let sortedArticles = scoredArticles
    
    switch (sortBy) {
      case 'relevance':
        sortedArticles = scoredArticles.sort((a, b) => b.score - a.score)
        break
      case 'date':
        sortedArticles = scoredArticles.sort((a, b) => 
          new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime())
        break
      case 'popularity':
        sortedArticles = scoredArticles.sort((a, b) => 
          (b.article.viewCount + b.article.likeCount) - (a.article.viewCount + a.article.likeCount))
        break
    }
    
    // 分页并添加上下文片段
    const paginatedArticles = sortedArticles
      .slice(offset, offset + limit)
      .map(item => {
        const contextSnippets = extractContextSnippets(item.article.content, query, 2, 120)
        return {
          ...item.article,
          contextSnippets,
          relevanceScore: item.score
        } as SearchResultArticle
      })
    
    return {
      articles: paginatedArticles,
      total: scoredArticles.length,
      query: query,
      searchTime: Date.now() - startTime
    }
  } catch (error) {
    console.error('Search error:', error)
    const { query: errorQuery = '' } = options
    return {
      articles: [],
      total: 0,
      query: errorQuery,
      searchTime: Date.now() - startTime
    }
  }
}

/**
 * 获取搜索建议
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  try {
    const allArticles = await loadAllPosts()
    const suggestions = new Set<string>()
    
    const lowerQuery = query.toLowerCase()
    
    // 从标题中提取建议
    allArticles.forEach(article => {
      if (article.isPublished) {
        const words = article.title.toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.includes(lowerQuery) && word !== lowerQuery) {
            suggestions.add(word)
          }
        })
        
        // 添加标签建议
        article.tags.forEach(tag => {
          if (tag.name.toLowerCase().includes(lowerQuery) && tag.name.toLowerCase() !== lowerQuery) {
            suggestions.add(tag.name)
          }
        })
        
        // 添加分类建议
        if (article.category.name.toLowerCase().includes(lowerQuery) && 
            article.category.name.toLowerCase() !== lowerQuery) {
          suggestions.add(article.category.name)
        }
      }
    })
    
    return Array.from(suggestions).slice(0, limit)
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return []
  }
}

/**
 * 高亮搜索关键词
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) return text
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
  let highlightedText = text
  
  queryWords.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  })
  
  return highlightedText
}

/**
 * 提取关键词上下文片段
 */
export function extractContextSnippets(content: string, query: string, maxSnippets: number = 3, contextLength: number = 100): string[] {
  if (!query.trim() || !content) return []
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
  const snippets: string[] = []
  const lowerContent = content.toLowerCase()
  
  // 为每个关键词查找匹配位置
  for (const word of queryWords) {
    let startIndex = 0
    
    while (startIndex < lowerContent.length && snippets.length < maxSnippets) {
      const matchIndex = lowerContent.indexOf(word, startIndex)
      
      if (matchIndex === -1) break
      
      // 计算上下文的开始和结束位置
      const contextStart = Math.max(0, matchIndex - contextLength / 2)
      const contextEnd = Math.min(content.length, matchIndex + word.length + contextLength / 2)
      
      // 提取上下文片段
      let snippet = content.substring(contextStart, contextEnd).trim()
      
      // 如果不是从开头开始，添加省略号
      if (contextStart > 0) {
        snippet = '...' + snippet
      }
      
      // 如果不是到结尾，添加省略号
      if (contextEnd < content.length) {
        snippet = snippet + '...'
      }
      
      // 避免重复的片段
      if (!snippets.some(existing => existing.includes(snippet.substring(3, snippet.length - 3)))) {
        snippets.push(snippet)
      }
      
      startIndex = matchIndex + word.length
    }
  }
  
  return snippets.slice(0, maxSnippets)
}