/**
 * 文章统计数据本地存储 Hook
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { useArticleStats } from './use-baidu-analytics';
import type { ArticleStats } from '@/lib/baidu-analytics';

interface CachedArticleStats {
  pvCount: number;
  visitorCount: number;
  lastUpdated: number;
}

interface UseArticleStatsStorageReturn {
  displayStats: {
    pvCount: number;
    visitorCount: number;
  };
  loading: boolean;
  error: string | null;
}

/**
 * 文章统计数据本地存储Hook
 */
export function useArticleStatsStorage(articleSlug: string): UseArticleStatsStorageReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 本地存储的文章统计数据
  const [cachedStats, setCachedStats] = useLocalStorage<CachedArticleStats>(
    `article-stats-${articleSlug}`,
    {
      pvCount: 0,
      visitorCount: 0,
      lastUpdated: 0
    }
  );

  // 获取百度统计数据
  const { stats: baiduStats, loading: baiduLoading, error: baiduError } = useArticleStats(articleSlug);

  // 当获取到新的百度统计数据时，更新本地存储
  useEffect(() => {
    if (baiduStats && (baiduStats.pvCount > 0 || baiduStats.visitorCount > 0)) {
      const newStats = {
        pvCount: baiduStats.pvCount,
        visitorCount: baiduStats.visitorCount,
        lastUpdated: Date.now()
      };
      
      // 只有数据真正变化时才更新
      if (newStats.pvCount !== cachedStats.pvCount || 
          newStats.visitorCount !== cachedStats.visitorCount) {
        console.log(`📊 更新文章 "${articleSlug}" 的本地统计数据:`, newStats);
        setCachedStats(newStats);
      }
    }
  }, [baiduStats, cachedStats, setCachedStats, articleSlug]);

  // 更新加载状态
  useEffect(() => {
    setLoading(baiduLoading);
    setError(baiduError);
  }, [baiduLoading, baiduError]);

  // 显示的数据：优先使用最新数据，否则使用缓存数据
  const displayStats = {
    pvCount: baiduStats?.pvCount || cachedStats.pvCount,
    visitorCount: baiduStats?.visitorCount || cachedStats.visitorCount
  };

  return {
    displayStats,
    loading,
    error
  };
}