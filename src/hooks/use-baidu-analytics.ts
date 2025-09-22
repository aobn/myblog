/**
 * 百度统计数据 Hook
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { useState, useEffect, useCallback } from 'react';
import { baiduAnalytics, type ArticleStats, type PageStats } from '@/lib/baidu-analytics';

// Hook 返回类型
interface UseBaiduAnalyticsReturn {
  articleStats: ArticleStats[];
  pageStats: PageStats[];
  totalStats: { totalPvCount: number; totalVisitorCount: number };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 单个文章统计 Hook 返回类型
interface UseArticleStatsReturn {
  stats: ArticleStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 获取所有百度统计数据的 Hook
 */
export function useBaiduAnalytics(
  startDate?: string,
  endDate?: string,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000 // 5分钟
): UseBaiduAnalyticsReturn {
  const [articleStats, setArticleStats] = useState<ArticleStats[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [totalStats, setTotalStats] = useState({ totalPvCount: 0, totalVisitorCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行获取所有数据
      const [allArticleStats, allPageStats, allTotalStats] = await Promise.all([
        baiduAnalytics.getAllArticleStats(),
        baiduAnalytics.getPageStats(startDate, endDate),
        baiduAnalytics.getTotalStats()
      ]);

      setArticleStats(allArticleStats);
      setPageStats(allPageStats);
      setTotalStats(allTotalStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取统计数据失败';
      setError(errorMessage);
      console.error('百度统计数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    articleStats,
    pageStats,
    totalStats,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * 获取单个文章统计数据的 Hook
 */
export function useArticleStats(articleSlug: string): UseArticleStatsReturn {
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!articleSlug) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const articleStats = await baiduAnalytics.getArticleStats(articleSlug);
      setStats(articleStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取文章统计数据失败';
      setError(errorMessage);
      console.error('文章统计数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, [articleSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * 获取总体统计数据的 Hook
 */
export function useTotalStats() {
  const [totalStats, setTotalStats] = useState({ totalPvCount: 0, totalVisitorCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await baiduAnalytics.getTotalStats();
      setTotalStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取总体统计数据失败';
      setError(errorMessage);
      console.error('总体统计数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    totalStats,
    loading,
    error,
    refetch: fetchData
  };
}