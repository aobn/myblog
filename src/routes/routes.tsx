import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import { BlogLayout } from '@/components/layout/blog-layout';
import { BlogHome } from '@/pages/BlogHome';
import { ArticleDetail } from '@/pages/ArticleDetail';

// 懒加载其他页面组件
import { lazy } from 'react';
const CategoriesPage = lazy(() => import('@/pages/Categories'));
const TagsPage = lazy(() => import('@/pages/Tags'));
const AboutPage = lazy(() => import('@/pages/About'));
const SearchPage = lazy(() => import('@/pages/Search'));
const ArchivePage = lazy(() => import('@/pages/Archive'));

// 404 页面组件
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">页面未找到</h2>
        <p className="text-muted-foreground">抱歉，您访问的页面不存在。</p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <BlogLayout />,
        children: [
          {
            index: true,
            element: <BlogHome />
          },
          {
            path: 'article/:id',
            element: <ArticleDetail />
          },
          {
            path: 'articles',
            element: <BlogHome />
          },
          {
            path: 'categories',
            element: <CategoriesPage />
          },
          {
            path: 'category/:slug',
            element: <BlogHome />
          },
          {
            path: 'tags',
            element: <TagsPage />
          },
          {
            path: 'tag/:slug',
            element: <BlogHome />
          },
          {
            path: 'search',
            element: <SearchPage />
          },
          {
            path: 'archive',
            element: <ArchivePage />
          },
          {
            path: 'archive/:month',
            element: <ArchivePage />
          },
          {
            path: 'about',
            element: <AboutPage />
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export default router;