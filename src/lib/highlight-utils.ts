/**
 * 文本高亮工具函数
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param query 搜索关键词
 * @returns 包含高亮标记的 JSX 元素
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) {
    return text
  }

  // 将查询词按空格分割，支持多关键词搜索
  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  
  if (keywords.length === 0) {
    return text
  }

  // 创建正则表达式，匹配所有关键词（不区分大小写）
  const regex = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi')
  
  // 分割文本并高亮匹配的部分
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    const isMatch = keywords.some(keyword => 
      part.toLowerCase() === keyword.toLowerCase()
    )
    
    if (isMatch) {
      return React.createElement(
        'span',
        {
          className: 'bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-1 py-0.5 rounded font-semibold',
          style: { backgroundColor: '#fde047', color: '#000' },
          key: index
        },
        part
      )
    }
    
    return part
  })
}

/**
 * 转义正则表达式特殊字符
 * @param string 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 截取包含关键词的文本片段
 * @param text 原始文本
 * @param query 搜索关键词
 * @param maxLength 最大长度
 * @returns 截取的文本片段
 */
export function extractRelevantSnippet(
  text: string, 
  query: string, 
  maxLength: number = 150
): string {
  if (!query.trim() || !text) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const lowerText = text.toLowerCase()
  
  // 找到第一个关键词的位置
  let firstMatchIndex = -1
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword)
    if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
      firstMatchIndex = index
    }
  }
  
  if (firstMatchIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }
  
  // 计算截取的起始位置，尽量让关键词居中
  const halfLength = Math.floor(maxLength / 2)
  const startIndex = Math.max(0, firstMatchIndex - halfLength)
  const endIndex = Math.min(text.length, startIndex + maxLength)
  
  let snippet = text.slice(startIndex, endIndex)
  
  // 添加省略号
  if (startIndex > 0) {
    snippet = '...' + snippet
  }
  if (endIndex < text.length) {
    snippet = snippet + '...'
  }
  
  return snippet
}

/**
 * 计算文本相关性得分（用于排序）
 * @param text 文本内容
 * @param query 搜索关键词
 * @returns 相关性得分
 */
export function calculateRelevanceScore(text: string, query: string): number {
  if (!query.trim() || !text) {
    return 0
  }

  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const lowerText = text.toLowerCase()
  let score = 0

  for (const keyword of keywords) {
    // 完全匹配得分更高
    const exactMatches = (lowerText.match(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'g')) || []).length
    score += exactMatches * 10

    // 部分匹配
    const partialMatches = (lowerText.match(new RegExp(escapeRegExp(keyword), 'g')) || []).length
    score += partialMatches * 5

    // 开头匹配得分更高
    if (lowerText.startsWith(keyword)) {
      score += 15
    }
  }

  return score
}