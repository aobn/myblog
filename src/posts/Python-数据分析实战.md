---
title: "Python 数据分析实战"
excerpt: "使用 Python 进行数据分析的完整指南，从数据清洗到可视化的实战技巧。"
author: "CodeBuddy"
category: "Python"
tags: ["Python", "数据分析", "pandas", "数据科学"]
publishedAt: "2024-06-10"
updatedAt: "2024-06-10"
readTime: 19
coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
isPublished: true
---

# Python 数据分析实战

Python 在数据分析领域占据主导地位。本文将通过实际案例展示如何使用 Python 进行完整的数据分析流程。

## 环境准备

### 必要库安装

```python
# 数据处理
import pandas as pd
import numpy as np

# 数据可视化
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go

# 机器学习
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 统计分析
from scipy import stats
import statsmodels.api as sm

# 设置显示选项
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")
```

## 数据加载和探索

### 数据加载

```python
# 从不同数据源加载数据
def load_data_from_sources():
    # CSV 文件
    df_csv = pd.read_csv('sales_data.csv', 
                        parse_dates=['date'],
                        dtype={'customer_id': str})
    
    # Excel 文件
    df_excel = pd.read_excel('financial_data.xlsx', 
                            sheet_name='Q1_2024',
                            skiprows=2)
    
    # JSON 文件
    df_json = pd.read_json('user_behavior.json', 
                          orient='records')
    
    # 数据库连接
    import sqlite3
    conn = sqlite3.connect('company.db')
    df_db = pd.read_sql_query("""
        SELECT * FROM employees 
        WHERE hire_date >= '2020-01-01'
    """, conn)
    conn.close()
    
    # API 数据
    import requests
    response = requests.get('https://api.example.com/data')
    df_api = pd.DataFrame(response.json())
    
    return df_csv, df_excel, df_json, df_db, df_api

# 数据基本信息
def explore_data(df):
    print("数据形状:", df.shape)
    print("\n数据类型:")
    print(df.dtypes)
    print("\n缺失值:")
    print(df.isnull().sum())
    print("\n数据描述:")
    print(df.describe())
    print("\n前5行:")
    print(df.head())
```

### 数据质量检查

```python
class DataQualityChecker:
    def __init__(self, df):
        self.df = df
        
    def check_duplicates(self):
        """检查重复数据"""
        duplicates = self.df.duplicated().sum()
        print(f"重复行数: {duplicates}")
        
        if duplicates > 0:
            print("重复行详情:")
            print(self.df[self.df.duplicated(keep=False)])
        
        return duplicates
    
    def check_missing_values(self):
        """检查缺失值"""
        missing = self.df.isnull().sum()
        missing_percent = (missing / len(self.df)) * 100
        
        missing_df = pd.DataFrame({
            'Missing Count': missing,
            'Missing Percentage': missing_percent
        })
        
        missing_df = missing_df[missing_df['Missing Count'] > 0]
        missing_df = missing_df.sort_values('Missing Count', ascending=False)
        
        print("缺失值统计:")
        print(missing_df)
        
        return missing_df
    
    def check_outliers(self, columns=None):
        """检查异常值"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns
        
        outliers_info = {}
        
        for col in columns:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = self.df[(self.df[col] < lower_bound) | 
                              (self.df[col] > upper_bound)]
            
            outliers_info[col] = {
                'count': len(outliers),
                'percentage': (len(outliers) / len(self.df)) * 100,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound
            }
        
        return outliers_info
    
    def data_profiling(self):
        """数据概况分析"""
        profile = {
            'shape': self.df.shape,
            'memory_usage': self.df.memory_usage(deep=True).sum(),
            'dtypes': self.df.dtypes.value_counts().to_dict(),
            'duplicates': self.check_duplicates(),
            'missing_values': self.check_missing_values(),
            'outliers': self.check_outliers()
        }
        
        return profile

# 使用示例
df = pd.read_csv('sales_data.csv')
checker = DataQualityChecker(df)
profile = checker.data_profiling()
```

## 数据清洗

### 处理缺失值

```python
class DataCleaner:
    def __init__(self, df):
        self.df = df.copy()
    
    def handle_missing_values(self, strategy='auto'):
        """处理缺失值"""
        for column in self.df.columns:
            missing_count = self.df[column].isnull().sum()
            
            if missing_count == 0:
                continue
                
            missing_ratio = missing_count / len(self.df)
            
            if missing_ratio > 0.5:
                print(f"删除列 {column} (缺失率: {missing_ratio:.2%})")
                self.df.drop(column, axis=1, inplace=True)
                continue
            
            if self.df[column].dtype in ['object', 'category']:
                # 分类变量
                if strategy == 'mode':
                    fill_value = self.df[column].mode()[0]
                elif strategy == 'unknown':
                    fill_value = 'Unknown'
                else:
                    fill_value = self.df[column].mode()[0]
                
                self.df[column].fillna(fill_value, inplace=True)
                
            else:
                # 数值变量
                if strategy == 'mean':
                    fill_value = self.df[column].mean()
                elif strategy == 'median':
                    fill_value = self.df[column].median()
                elif strategy == 'forward_fill':
                    self.df[column].fillna(method='ffill', inplace=True)
                    continue
                elif strategy == 'interpolate':
                    self.df[column].interpolate(inplace=True)
                    continue
                else:
                    fill_value = self.df[column].median()
                
                self.df[column].fillna(fill_value, inplace=True)
        
        return self.df
    
    def remove_outliers(self, columns=None, method='iqr'):
        """移除异常值"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns
        
        original_shape = self.df.shape
        
        for col in columns:
            if method == 'iqr':
                Q1 = self.df[col].quantile(0.25)
                Q3 = self.df[col].quantile(0.75)
                IQR = Q3 - Q1
                
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                self.df = self.df[(self.df[col] >= lower_bound) & 
                                 (self.df[col] <= upper_bound)]
            
            elif method == 'zscore':
                z_scores = np.abs(stats.zscore(self.df[col]))
                self.df = self.df[z_scores < 3]
        
        print(f"移除异常值前: {original_shape}")
        print(f"移除异常值后: {self.df.shape}")
        
        return self.df
    
    def standardize_formats(self):
        """标准化数据格式"""
        for column in self.df.columns:
            if self.df[column].dtype == 'object':
                # 字符串标准化
                self.df[column] = self.df[column].str.strip()
                self.df[column] = self.df[column].str.title()
                
                # 日期格式检测和转换
                if 'date' in column.lower() or 'time' in column.lower():
                    try:
                        self.df[column] = pd.to_datetime(self.df[column])
                    except:
                        pass
        
        return self.df

# 使用示例
cleaner = DataCleaner(df)
df_cleaned = cleaner.handle_missing_values(strategy='median')
df_cleaned = cleaner.remove_outliers(method='iqr')
df_cleaned = cleaner.standardize_formats()
```

## 探索性数据分析

### 统计分析

```python
class ExploratoryAnalysis:
    def __init__(self, df):
        self.df = df
    
    def univariate_analysis(self):
        """单变量分析"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        categorical_cols = self.df.select_dtypes(include=['object', 'category']).columns
        
        # 数值变量分析
        print("=== 数值变量分析 ===")
        for col in numeric_cols:
            print(f"\n{col}:")
            print(f"均值: {self.df[col].mean():.2f}")
            print(f"中位数: {self.df[col].median():.2f}")
            print(f"标准差: {self.df[col].std():.2f}")
            print(f"偏度: {self.df[col].skew():.2f}")
            print(f"峰度: {self.df[col].kurtosis():.2f}")
        
        # 分类变量分析
        print("\n=== 分类变量分析 ===")
        for col in categorical_cols:
            print(f"\n{col}:")
            value_counts = self.df[col].value_counts()
            print(value_counts.head())
            print(f"唯一值数量: {self.df[col].nunique()}")
    
    def bivariate_analysis(self, target_col):
        """双变量分析"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        categorical_cols = self.df.select_dtypes(include=['object', 'category']).columns
        
        correlations = {}
        
        # 数值变量与目标变量的相关性
        for col in numeric_cols:
            if col != target_col:
                corr = self.df[col].corr(self.df[target_col])
                correlations[col] = corr
        
        # 按相关性排序
        sorted_corr = sorted(correlations.items(), 
                           key=lambda x: abs(x[1]), 
                           reverse=True)
        
        print("与目标变量的相关性:")
        for col, corr in sorted_corr:
            print(f"{col}: {corr:.3f}")
        
        return sorted_corr
    
    def correlation_matrix(self):
        """相关性矩阵"""
        numeric_df = self.df.select_dtypes(include=[np.number])
        correlation_matrix = numeric_df.corr()
        
        # 可视化相关性矩阵
        plt.figure(figsize=(12, 10))
        sns.heatmap(correlation_matrix, 
                   annot=True, 
                   cmap='coolwarm', 
                   center=0,
                   square=True)
        plt.title('变量相关性矩阵')
        plt.tight_layout()
        plt.show()
        
        return correlation_matrix

# 使用示例
eda = ExploratoryAnalysis(df_cleaned)
eda.univariate_analysis()
correlations = eda.bivariate_analysis('sales_amount')
corr_matrix = eda.correlation_matrix()
```

### 数据可视化

```python
class DataVisualizer:
    def __init__(self, df):
        self.df = df
        
    def plot_distributions(self, columns=None):
        """绘制分布图"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns
        
        n_cols = 3
        n_rows = (len(columns) + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 5*n_rows))
        axes = axes.flatten() if n_rows > 1 else [axes]
        
        for i, col in enumerate(columns):
            if i < len(axes):
                # 直方图和密度图
                self.df[col].hist(bins=30, alpha=0.7, ax=axes[i])
                self.df[col].plot(kind='density', ax=axes[i], secondary_y=True)
                axes[i].set_title(f'{col} 分布')
                axes[i].set_xlabel(col)
        
        # 隐藏多余的子图
        for i in range(len(columns), len(axes)):
            axes[i].set_visible(False)
        
        plt.tight_layout()
        plt.show()
    
    def plot_boxplots(self, columns=None):
        """绘制箱线图"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns
        
        n_cols = 3
        n_rows = (len(columns) + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 5*n_rows))
        axes = axes.flatten() if n_rows > 1 else [axes]
        
        for i, col in enumerate(columns):
            if i < len(axes):
                self.df.boxplot(column=col, ax=axes[i])
                axes[i].set_title(f'{col} 箱线图')
        
        for i in range(len(columns), len(axes)):
            axes[i].set_visible(False)
        
        plt.tight_layout()
        plt.show()
    
    def plot_scatter_matrix(self, columns=None, target=None):
        """绘制散点图矩阵"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns[:6]
        
        if target:
            scatter_df = self.df[list(columns) + [target]]
            pd.plotting.scatter_matrix(scatter_df, 
                                     c=self.df[target], 
                                     figsize=(15, 15),
                                     alpha=0.6)
        else:
            pd.plotting.scatter_matrix(self.df[columns], 
                                     figsize=(15, 15),
                                     alpha=0.6)
        
        plt.suptitle('散点图矩阵')
        plt.tight_layout()
        plt.show()
    
    def plot_time_series(self, date_col, value_col, freq='D'):
        """绘制时间序列图"""
        # 确保日期列是datetime类型
        self.df[date_col] = pd.to_datetime(self.df[date_col])
        
        # 按日期排序
        df_sorted = self.df.sort_values(date_col)
        
        # 重采样（如果需要）
        if freq != 'D':
            df_resampled = df_sorted.set_index(date_col)[value_col].resample(freq).sum()
        else:
            df_resampled = df_sorted.set_index(date_col)[value_col]
        
        plt.figure(figsize=(15, 6))
        plt.plot(df_resampled.index, df_resampled.values)
        plt.title(f'{value_col} 时间序列')
        plt.xlabel('日期')
        plt.ylabel(value_col)
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.show()
        
        return df_resampled

# 使用示例
visualizer = DataVisualizer(df_cleaned)
visualizer.plot_distributions()
visualizer.plot_boxplots()
visualizer.plot_scatter_matrix(target='category')
```

## 高级分析技术

### 聚类分析

```python
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

class ClusterAnalysis:
    def __init__(self, df):
        self.df = df
        self.scaler = StandardScaler()
    
    def prepare_data(self, columns=None):
        """准备聚类数据"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns
        
        # 选择数值列
        data = self.df[columns].copy()
        
        # 处理缺失值
        data = data.fillna(data.median())
        
        # 标准化
        data_scaled = self.scaler.fit_transform(data)
        
        return data_scaled, columns
    
    def kmeans_clustering(self, n_clusters=3, columns=None):
        """K-means聚类"""
        data_scaled, feature_names = self.prepare_data(columns)
        
        # K-means聚类
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(data_scaled)
        
        # 添加聚类结果到原数据
        self.df['cluster'] = clusters
        
        # 聚类中心
        centers = self.scaler.inverse_transform(kmeans.cluster_centers_)
        centers_df = pd.DataFrame(centers, columns=feature_names)
        
        print("聚类中心:")
        print(centers_df)
        
        # 聚类统计
        cluster_stats = self.df.groupby('cluster').agg({
            col: ['mean', 'std', 'count'] for col in feature_names
        })
        
        print("\n聚类统计:")
        print(cluster_stats)
        
        return clusters, centers_df
    
    def find_optimal_clusters(self, max_clusters=10, columns=None):
        """寻找最优聚类数"""
        data_scaled, _ = self.prepare_data(columns)
        
        inertias = []
        silhouette_scores = []
        
        from sklearn.metrics import silhouette_score
        
        for k in range(2, max_clusters + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            clusters = kmeans.fit_predict(data_scaled)
            
            inertias.append(kmeans.inertia_)
            silhouette_scores.append(silhouette_score(data_scaled, clusters))
        
        # 绘制肘部法则图
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        ax1.plot(range(2, max_clusters + 1), inertias, 'bo-')
        ax1.set_xlabel('聚类数')
        ax1.set_ylabel('惯性')
        ax1.set_title('肘部法则')
        ax1.grid(True)
        
        ax2.plot(range(2, max_clusters + 1), silhouette_scores, 'ro-')
        ax2.set_xlabel('聚类数')
        ax2.set_ylabel('轮廓系数')
        ax2.set_title('轮廓分析')
        ax2.grid(True)
        
        plt.tight_layout()
        plt.show()
        
        # 推荐最优聚类数
        optimal_k = range(2, max_clusters + 1)[np.argmax(silhouette_scores)]
        print(f"推荐聚类数: {optimal_k}")
        
        return optimal_k
    
    def visualize_clusters(self, columns=None):
        """可视化聚类结果"""
        data_scaled, feature_names = self.prepare_data(columns)
        
        # PCA降维到2D
        pca = PCA(n_components=2)
        data_2d = pca.fit_transform(data_scaled)
        
        plt.figure(figsize=(10, 8))
        scatter = plt.scatter(data_2d[:, 0], data_2d[:, 1], 
                            c=self.df['cluster'], 
                            cmap='viridis', 
                            alpha=0.6)
        plt.colorbar(scatter)
        plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)')
        plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)')
        plt.title('聚类结果可视化 (PCA)')
        plt.grid(True, alpha=0.3)
        plt.show()

# 使用示例
cluster_analysis = ClusterAnalysis(df_cleaned)
optimal_k = cluster_analysis.find_optimal_clusters()
clusters, centers = cluster_analysis.kmeans_clustering(n_clusters=optimal_k)
cluster_analysis.visualize_clusters()
```

### 预测建模

```python
class PredictiveModeling:
    def __init__(self, df, target_column):
        self.df = df
        self.target_column = target_column
        self.models = {}
        self.results = {}
    
    def prepare_features(self, test_size=0.2):
        """准备特征和目标变量"""
        # 分离特征和目标
        X = self.df.drop(columns=[self.target_column])
        y = self.df[self.target_column]
        
        # 处理分类变量
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns
        
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
        
        # 处理缺失值
        X = X.fillna(X.median())
        
        # 分割训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # 特征缩放
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.X_train = X_train_scaled
        self.X_test = X_test_scaled
        self.y_train = y_train
        self.y_test = y_test
        self.feature_names = X.columns.tolist()
        self.scaler = scaler
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_models(self):
        """训练多个模型"""
        from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
        from sklearn.svm import SVR
        from sklearn.linear_model import Ridge
        
        models = {
            'Linear Regression': LinearRegression(),
            'Ridge Regression': Ridge(alpha=1.0),
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'SVR': SVR(kernel='rbf')
        }
        
        for name, model in models.items():
            print(f"训练 {name}...")
            model.fit(self.X_train, self.y_train)
            
            # 预测
            y_pred_train = model.predict(self.X_train)
            y_pred_test = model.predict(self.X_test)
            
            # 评估
            train_mse = mean_squared_error(self.y_train, y_pred_train)
            test_mse = mean_squared_error(self.y_test, y_pred_test)
            train_r2 = r2_score(self.y_train, y_pred_train)
            test_r2 = r2_score(self.y_test, y_pred_test)
            
            self.models[name] = model
            self.results[name] = {
                'train_mse': train_mse,
                'test_mse': test_mse,
                'train_r2': train_r2,
                'test_r2': test_r2,
                'y_pred_test': y_pred_test
            }
        
        return self.results
    
    def compare_models(self):
        """比较模型性能"""
        comparison_df = pd.DataFrame({
            name: {
                'Train MSE': results['train_mse'],
                'Test MSE': results['test_mse'],
                'Train R²': results['train_r2'],
                'Test R²': results['test_r2']
            }
            for name, results in self.results.items()
        }).T
        
        print("模型性能比较:")
        print(comparison_df.round(4))
        
        # 可视化比较
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # MSE比较
        comparison_df[['Train MSE', 'Test MSE']].plot(kind='bar', ax=axes[0,0])
        axes[0,0].set_title('MSE 比较')
        axes[0,0].set_ylabel('MSE')
        
        # R²比较
        comparison_df[['Train R²', 'Test R²']].plot(kind='bar', ax=axes[0,1])
        axes[0,1].set_title('R² 比较')
        axes[0,1].set_ylabel('R²')
        
        # 预测vs实际散点图（最佳模型）
        best_model_name = comparison_df['Test R²'].idxmax()
        best_predictions = self.results[best_model_name]['y_pred_test']
        
        axes[1,0].scatter(self.y_test, best_predictions, alpha=0.6)
        axes[1,0].plot([self.y_test.min(), self.y_test.max()], 
                      [self.y_test.min(), self.y_test.max()], 'r--')
        axes[1,0].set_xlabel('实际值')
        axes[1,0].set_ylabel('预测值')
        axes[1,0].set_title(f'{best_model_name} - 预测vs实际')
        
        # 残差图
        residuals = self.y_test - best_predictions
        axes[1,1].scatter(best_predictions, residuals, alpha=0.6)
        axes[1,1].axhline(y=0, color='r', linestyle='--')
        axes[1,1].set_xlabel('预测值')
        axes[1,1].set_ylabel('残差')
        axes[1,1].set_title(f'{best_model_name} - 残差图')
        
        plt.tight_layout()
        plt.show()
        
        return comparison_df
    
    def feature_importance(self, model_name='Random Forest'):
        """特征重要性分析"""
        if model_name not in self.models:
            print(f"模型 {model_name} 不存在")
            return
        
        model = self.models[model_name]
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            
            feature_importance_df = pd.DataFrame({
                'feature': self.feature_names,
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            plt.figure(figsize=(10, 8))
            sns.barplot(data=feature_importance_df.head(15), 
                       x='importance', y='feature')
            plt.title(f'{model_name} - 特征重要性')
            plt.xlabel('重要性')
            plt.tight_layout()
            plt.show()
            
            return feature_importance_df
        else:
            print(f"模型 {model_name} 不支持特征重要性分析")

# 使用示例
modeling = PredictiveModeling(df_cleaned, 'sales_amount')
X_train, X_test, y_train, y_test = modeling.prepare_features()
results = modeling.train_models()
comparison = modeling.compare_models()
importance = modeling.feature_importance()
```

## 总结

Python 数据分析的核心流程：

1. **数据加载** - 从多种数据源获取数据
2. **数据清洗** - 处理缺失值、异常值、格式标准化
3. **探索性分析** - 统计描述、相关性分析、可视化
4. **高级分析** - 聚类分析、预测建模
5. **结果解释** - 模型评估、特征重要性分析

掌握这些技能将让你能够高效地进行数据分析和挖掘工作。