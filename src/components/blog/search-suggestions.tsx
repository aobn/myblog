/**
 * 搜索建议组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Hash, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchArticles } from '@/lib/search-service'
import { highlightText, extractRelevantSnippet } from '@/lib/highlight-utils'
import type { Article } from '@/types/blog'

interface SearchSuggestionsProps {
  query: string
  isOpen: boolean
  onClose: () => void
  onSelect: (query: string) => void
  className?: string
}

interface SuggestionItem {
  id: string
  type: 'article' | 'tag' | 'category'
  title: string
  subtitle?: string
  icon: React.ReactNode
  onClick: () => void
}

export function SearchSuggestions({ 
  query, 
  isOpen, 
  onClose, 
  onSelect, 
  className 
}: SearchSuggestionsProps) {
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = React.useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)



  // 获取搜索建议
  const fetchSuggestions = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const result = await searchArticles({
        query: searchQuery,
        sortBy: 'relevance',
        filterBy: 'all',
        limit: 8
      })

      const articleSuggestions: SuggestionItem[] = result.articles.slice(0, 5).map((article: Article) => ({
        id: `article-${article.id}`,
        type: 'article' as const,
        title: article.title,
        subtitle: extractRelevantSnippet(article.excerpt || article.content, searchQuery, 100),
        icon: <Search className="h-4 w-4" />,
        onClick: () => {
          navigate(`/article/${article.id}`)
          onClose()
        }
      }))

      // 添加标签建议
      const allTags = result.articles.flatMap((article: Article) => article.tags || [])
      const uniqueTagsMap = new Map()
      allTags.forEach(tag => {
        if (!uniqueTagsMap.has(tag.name)) {
          uniqueTagsMap.set(tag.name, tag)
        }
      })
      const uniqueTags = Array.from(uniqueTagsMap.values()).slice(0, 3)

      const tagSuggestions: SuggestionItem[] = uniqueTags.map((tag) => ({
        id: `tag-${tag.name}`,
        type: 'tag' as const,
        title: `标签: ${tag.name}`,
        subtitle: `搜索所有 "${tag.name}" 相关文章`,
        icon: <Hash className="h-4 w-4" />,
        onClick: () => {
          navigate(`/tags?tag=${encodeURIComponent(tag.name)}`)
          onClose()
        }
      }))

      // 添加分类建议
      const allCategories = result.articles.map((article: Article) => article.category).filter(Boolean)
      const uniqueCategoriesMap = new Map()
      allCategories.forEach(category => {
        if (!uniqueCategoriesMap.has(category.name)) {
          uniqueCategoriesMap.set(category.name, category)
        }
      })
      const uniqueCategories = Array.from(uniqueCategoriesMap.values()).slice(0, 2)

      const categorySuggestions: SuggestionItem[] = uniqueCategories.map((category) => ({
        id: `category-${category.name}`,
        type: 'category' as const,
        title: `分类: ${category.name}`,
        subtitle: `浏览 "${category.name}" 分类下的所有文章`,
        icon: <Folder className="h-4 w-4" />,
        onClick: () => {
          navigate(`/categories?category=${encodeURIComponent(category.name)}`)
          onClose()
        }
      }))

      setSuggestions([...articleSuggestions, ...tagSuggestions, ...categorySuggestions])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [navigate, onClose])

  // 当查询变化时获取建议
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, fetchSuggestions])

  // 键盘导航
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          suggestions[selectedIndex].onClick()
        } else if (query.trim()) {
          onSelect(query)
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, suggestions, selectedIndex, query, onSelect, onClose])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 重置选中索引当建议变化时
  React.useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  if (!isOpen || (!isLoading && suggestions.length === 0 && !query.trim())) {
    return null
  }

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto",
      className
    )}>
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">搜索中...</p>
        </div>
      )}

      {!isLoading && suggestions.length === 0 && query.trim() && (
        <div className="p-4 text-center">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">未找到相关建议</p>
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => onSelect(query)}
          >
            搜索 "{query}"
          </button>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3",
                selectedIndex === index && "bg-accent"
              )}
              onClick={suggestion.onClick}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {suggestion.type === 'article' ? 
                    highlightText(suggestion.title, query) : 
                    suggestion.title
                  }
                </div>
                {suggestion.subtitle && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {suggestion.type === 'article' ? 
                      highlightText(suggestion.subtitle, query) : 
                      suggestion.subtitle
                    }
                  </div>
                )}
              </div>
              {suggestion.type === 'article' && (
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}

          {query.trim() && (
            <div className="border-t">
              <button
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3",
                  selectedIndex === suggestions.length && "bg-accent"
                )}
                onClick={() => onSelect(query)}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  搜索 "<span className="font-medium">{query}</span>"
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}