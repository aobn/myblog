/**
 * 百度统计数据管理页面
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { useState } from 'react';
import { RefreshCw, Download, Calendar, TrendingUp, Users, Eye, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TotalStatsDisplay } from '@/components/blog/stats-display';
import { useBaiduAnalytics } from '@/hooks/use-baidu-analytics';

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { 
    articleStats, 
    pageStats, 
 
    loading, 
    error, 
    refetch 
  } = useBaiduAnalytics(dateRange.startDate, dateRange.endDate, true);

  // 设置日期范围
  const setDateRangePreset = (preset: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const startDate = new Date();

    switch (preset) {
      case 'today':
        setDateRange({
          startDate: formatDate(today),
          endDate: formatDate(today)
        });
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        setDateRange({
          startDate: formatDate(startDate),
          endDate: formatDate(today)
        });
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        setDateRange({
          startDate: formatDate(startDate),
          endDate: formatDate(today)
        });
        break;
      case 'all':
        setDateRange({});
        break;
    }
  };

  // 导出数据
  const exportData = () => {
    const csvContent = [
      ['文章标题', '文章链接', '浏览量(PV)', '访客数(UV)'],
      ...articleStats.map(article => [
        article.title || article.articleSlug,
        article.url,
        article.pvCount.toString(),
        article.visitorCount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blog-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据统计</h1>
          <p className="text-muted-foreground mt-1">
            基于百度统计的博客访问数据分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={loading || articleStats.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 日期范围选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            时间范围
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRangePreset('today')}
            >
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRangePreset('week')}
            >
              最近7天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRangePreset('month')}
            >
              最近30天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRangePreset('all')}
            >
              全部时间
            </Button>
          </div>
          {(dateRange.startDate || dateRange.endDate) && (
            <div className="mt-2 text-sm text-muted-foreground">
              当前范围: {dateRange.startDate || '开始'} ~ {dateRange.endDate || '现在'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 总体统计 */}
      <TotalStatsDisplay />

      {/* 文章统计表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            文章统计详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : articleStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无文章统计数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文章标题</TableHead>
                    <TableHead>文章链接</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        浏览量(PV)
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        访客数(UV)
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articleStats
                    .sort((a, b) => b.pvCount - a.pvCount)
                    .map((article, index) => (
                    <TableRow key={article.articleSlug || index}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate">
                          {article.title || article.articleSlug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm max-w-xs truncate block"
                        >
                          {article.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {formatNumber(article.pvCount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {formatNumber(article.visitorCount)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 所有页面统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            所有页面统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pageStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无页面统计数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>页面链接</TableHead>
                    <TableHead className="text-center">浏览量(PV)</TableHead>
                    <TableHead className="text-center">访客数(UV)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageStats
                    .sort((a, b) => b.pvCount - a.pvCount)
                    .slice(0, 10)
                    .map((page, index) => (
                    <TableRow key={page.pageId || index}>
                      <TableCell>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm max-w-md truncate block"
                        >
                          {page.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {formatNumber(page.pvCount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {formatNumber(page.visitorCount)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}