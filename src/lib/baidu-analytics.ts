 /**
 * 百度统计 API 服务
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { getAnalyticsConfig } from '@/config/analytics';

// 获取百度统计配置
const config = getAnalyticsConfig();

// 百度统计 API 响应类型定义
export interface BaiduAnalyticsResponse {
  result: {
    offset: number;
    timeSpan: string[];
    fields: string[];
    total: number;
    sum: number[][];
    pageSum: number[][];
    items: Array<Array<Array<{ name: string; pageId: string }> | number[]>>;
  };
}

// 页面统计数据类型
export interface PageStats {
  url: string;
  pageId: string;
  pvCount: number;
  visitorCount: number;
}

// 文章统计数据类型
export interface ArticleStats {
  articleSlug: string;
  title: string;
  pvCount: number;
  visitorCount: number;
  url: string;
}

/**
 * 百度统计服务类
 */
export class BaiduAnalyticsService {
  private static instance: BaiduAnalyticsService;
  private cache: Map<string, PageStats[]> = new Map();
  private cacheExpiry: number = config.cache.expiry;
  private lastFetchTime: number = 0;

  private constructor() {}

  public static getInstance(): BaiduAnalyticsService {
    if (!BaiduAnalyticsService.instance) {
      BaiduAnalyticsService.instance = new BaiduAnalyticsService();
    }
    return BaiduAnalyticsService.instance;
  }

  /**
   * 获取受访页面数据
   */
  async getPageStats(startDate?: string, endDate?: string): Promise<PageStats[]> {
    const cacheKey = `${startDate || 'all'}-${endDate || 'all'}`;
    const now = Date.now();

    // 检查缓存
    if (this.cache.has(cacheKey) && (now - this.lastFetchTime) < this.cacheExpiry) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const url = this.buildApiUrl(startDate, endDate);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`百度统计 API 请求失败: ${response.status}`);
      }

      const data: BaiduAnalyticsResponse = await response.json();
      const pageStats = this.parsePageStats(data);

      // 更新缓存
      this.cache.set(cacheKey, pageStats);
      this.lastFetchTime = now;

      return pageStats;
    } catch (error) {
      console.error('获取百度统计数据失败:', error);
      // 返回缓存数据或空数组
      return this.cache.get(cacheKey) || [];
    }
  }

  /**
   * 获取特定文章的统计数据
   */
  async getArticleStats(articleSlug: string): Promise<ArticleStats | null> {
    console.log(`🔍 正在查找文章 "${articleSlug}" 的统计数据...`);
    
    const pageStats = await this.getPageStats();
    
    console.log(`📊 从 ${pageStats.length} 条页面数据中查找匹配项...`);
    
    // 查找匹配的文章页面 - 支持 URL 编码匹配
    const matchingPage = pageStats.find(page => {
      // 从页面 URL 中提取解码后的 slug
      const pageSlug = this.extractSlugFromUrl(page.url);
      
      console.log(`🔍 比较: "${articleSlug}" vs "${pageSlug}" (来自 ${page.url})`);
      
      // 多种匹配策略
      return (
        // 1. 直接匹配解码后的 slug
        pageSlug === articleSlug ||
        // 2. 匹配 URL 编码的版本
        page.url.includes(`/article/${encodeURIComponent(articleSlug)}`) ||
        // 3. 匹配未编码的版本
        page.url.includes(`/article/${articleSlug}`) ||
        // 4. 部分匹配（去除特殊字符）
        pageSlug.replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '') === articleSlug.replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '')
      );
    });

    if (!matchingPage) {
      console.log(`❌ 未找到文章 "${articleSlug}" 的统计数据`);
      console.log('📋 可用的页面URL和解码后的slug列表:');
      pageStats.forEach(p => {
        console.log(`  - URL: ${p.url}`);
        console.log(`    解码slug: ${this.extractSlugFromUrl(p.url)}`);
      });
      return null;
    }

    const result = {
      articleSlug,
      title: this.extractTitleFromUrl(matchingPage.url),
      pvCount: matchingPage.pvCount,
      visitorCount: matchingPage.visitorCount,
      url: matchingPage.url
    };

    console.log(`✅ 找到文章 "${articleSlug}" 的统计数据:`, {
      文章标识: result.articleSlug,
      文章标题: result.title,
      浏览量: result.pvCount,
      访客量: result.visitorCount,
      匹配URL: result.url,
      解码后的slug: this.extractSlugFromUrl(matchingPage.url)
    });

    return result;
  }

  /**
   * 获取所有文章的统计数据
   */
  async getAllArticleStats(): Promise<ArticleStats[]> {
    const pageStats = await this.getPageStats();
    
    // 过滤出文章页面
    const articlePages = pageStats.filter(page => 
      page.url.includes('/article/') || 
      this.isArticlePage(page.url)
    );

    return articlePages.map(page => ({
      articleSlug: this.extractSlugFromUrl(page.url),
      title: this.extractTitleFromUrl(page.url),
      pvCount: page.pvCount,
      visitorCount: page.visitorCount,
      url: page.url
    }));
  }

  /**
   * 构建 API 请求 URL
   */
  private buildApiUrl(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams({
      access_token: config.accessToken,
      site_id: config.siteId,
      method: config.api.method,
      metrics: config.api.metrics,
      start_index: config.api.startIndex.toString(),
      max_results: config.api.maxResults.toString()
    });

    if (startDate) {
      params.append('start_date', startDate);
    }
    if (endDate) {
      params.append('end_date', endDate);
    }

    // 使用 Vite 代理路径
    return `/api/baidu/rest/2.0/tongji/report/getData?${params.toString()}`;
  }

  /**
   * 解析百度统计 API 响应数据
   */
  private parsePageStats(data: BaiduAnalyticsResponse): PageStats[] {
    console.log('🔍 百度统计 API 原始响应数据:', data);
    
    const { items } = data.result;
    
    if (!items || items.length < 2) {
      console.warn('⚠️ 百度统计 API 响应数据格式异常，items 长度不足');
      return [];
    }

    const [urlItems, statsItems] = items;
    const pageStats: PageStats[] = [];

    console.log(`📊 开始解析 ${urlItems.length} 条统计数据...`);

    // 遍历每个页面的数据
    for (let i = 0; i < urlItems.length; i++) {
      const urlItem = urlItems[i];
      const statsItem = statsItems[i];

      if (Array.isArray(urlItem) && urlItem[0] && Array.isArray(statsItem)) {
        const pageInfo = urlItem[0] as { name: string; pageId: string };
        const [pvCount, visitorCount] = statsItem as number[];

        const parsedStat = {
          url: pageInfo.name,
          pageId: pageInfo.pageId,
          pvCount: pvCount || 0,
          visitorCount: visitorCount || 0
        };

        pageStats.push(parsedStat);

        // 打印每条解析后的数据
        console.log(`📄 第${i + 1}条数据:`, {
          URL: pageInfo.name,
          页面ID: pageInfo.pageId,
          浏览量: pvCount || 0,
          访客量: visitorCount || 0,
          提取的标题: this.extractTitleFromUrl(pageInfo.name)
        });
      }
    }

    console.log(`✅ 解析完成，共获得 ${pageStats.length} 条有效统计数据`);
    console.log('📈 统计数据汇总:', pageStats.map(s => ({
      标题: this.extractTitleFromUrl(s.url),
      URL: s.url,
      浏览量: s.pvCount,
      访客量: s.visitorCount
    })));

    return pageStats;
  }

  /**
   * 从 URL 中提取文章 slug
   */
  private extractSlugFromUrl(url: string): string {
    const match = url.match(/\/article\/([^/?#]+)/);
    if (!match) return '';
    
    // 解码 URL 编码的中文字符
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  /**
   * 从 URL 中提取标题
   */
  private extractTitleFromUrl(url: string): string {
    const slug = this.extractSlugFromUrl(url);
    if (!slug) return '';
    
    // 将连字符替换为空格，用于显示
    return slug.replace(/-/g, ' ');
  }

  /**
   * 判断是否为文章页面
   */
  private isArticlePage(url: string): boolean {
    return url.includes('/article/') || 
           url.match(/\/\d{4}-/) !== null || // 匹配年份格式
           url.includes('测试文章') ||
           url.includes('最佳实践');
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFetchTime = 0;
  }

  /**
   * 获取总体统计数据
   */
  async getTotalStats(): Promise<{ totalPvCount: number; totalVisitorCount: number }> {
    try {
      const url = this.buildApiUrl();
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`百度统计 API 请求失败: ${response.status}`);
      }

      const data: BaiduAnalyticsResponse = await response.json();
      
      console.log('📊 百度统计总数据 API 响应:', data);
      
      // 从 sum 字段获取总数据 [总浏览量, 总访客量]
      if (data.result && data.result.sum && data.result.sum.length > 0) {
        const [totalPvCount, totalVisitorCount] = data.result.sum[0];
        
        console.log('📈 解析的总统计数据:', {
          总浏览量: totalPvCount,
          总访客量: totalVisitorCount
        });
        
        return { 
          totalPvCount: totalPvCount || 0, 
          totalVisitorCount: totalVisitorCount || 0 
        };
      }
      
      // 如果没有 sum 数据，则从页面数据计算
      const pageStats = await this.getPageStats();
      const totalPvCount = pageStats.reduce((sum, page) => sum + page.pvCount, 0);
      const totalVisitorCount = pageStats.reduce((sum, page) => sum + page.visitorCount, 0);

      return { totalPvCount, totalVisitorCount };
    } catch (error) {
      console.error('获取总统计数据失败:', error);
      return { totalPvCount: 0, totalVisitorCount: 0 };
    }
  }
}

// 导出单例实例
export const baiduAnalytics = BaiduAnalyticsService.getInstance();