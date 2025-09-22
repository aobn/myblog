/**
 * 百度统计配置文件
 * 
 * @author xxh
 * @date 2025-09-23
 */

// 百度统计配置
export const BAIDU_ANALYTICS_CONFIG = {
  // API 基础配置
  baseUrl: 'https://openapi.baidu.com/rest/2.0/tongji/report/getData',
  
  // 访问令牌 - 需要定期更新
  accessToken: '121.05bbe53f1050a1774f94f0444ed95d5f.Y7QVXBDa88kmz4aN0EbKmXtdZZVlwavoRPUSYQA.yp5QXQ',
  
  // 站点 ID
  siteId: '22468525',
  
  // 百度统计站点代码 - 用于页面统计
  siteCode: 'db576854c7d1f5a4decff72ed959872b',
  
  // API 请求配置
  api: {
    method: 'visit/toppage/a',
    metrics: 'pv_count,visitor_count',
    maxResults: 3000,
    startIndex: 0
  },
  
  // 缓存配置
  cache: {
    expiry: 5 * 60 * 1000, // 5分钟缓存
    enabled: true
  },
  
  // 自动刷新配置
  autoRefresh: {
    enabled: true,
    interval: 5 * 60 * 1000 // 5分钟自动刷新
  }
};

// 环境变量配置（可选）
export const getAnalyticsConfig = () => {
  return {
    ...BAIDU_ANALYTICS_CONFIG,
    // 如果有环境变量，优先使用环境变量
    accessToken: import.meta.env.VITE_BAIDU_ACCESS_TOKEN || BAIDU_ANALYTICS_CONFIG.accessToken,
    siteId: import.meta.env.VITE_BAIDU_SITE_ID || BAIDU_ANALYTICS_CONFIG.siteId,
    siteCode: import.meta.env.VITE_BAIDU_SITE_CODE || BAIDU_ANALYTICS_CONFIG.siteCode,
  };
};