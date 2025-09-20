---
title: "CSS Grid 布局完全指南"
excerpt: "掌握 CSS Grid 布局系统，创建复杂而灵活的网页布局。"
author: "CodeBuddy"
category: "CSS"
tags: ["CSS", "Grid", "布局", "前端开发"]
publishedAt: "2024-05-12"
updatedAt: "2024-05-12"
readTime: 14
coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"
isPublished: true
---

# CSS Grid 布局完全指南

CSS Grid 是一个强大的二维布局系统，让我们能够轻松创建复杂的网页布局。本文将全面介绍 Grid 布局的各个方面。

## 基础概念

### Grid 容器和项目

```css
/* Grid 容器 */
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
  gap: 10px;
}

/* Grid 项目会自动排列 */
.item {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 20px;
  text-align: center;
}
```

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

### 网格线和网格轨道

```css
.container {
  display: grid;
  /* 定义列轨道 */
  grid-template-columns: 100px 200px 100px;
  /* 定义行轨道 */
  grid-template-rows: 50px 100px 50px;
  
  /* 网格线从 1 开始编号 */
  /* 列线：1, 2, 3, 4 */
  /* 行线：1, 2, 3, 4 */
}
```

## 定义网格

### 使用固定尺寸

```css
.grid-fixed {
  display: grid;
  grid-template-columns: 200px 300px 200px;
  grid-template-rows: 100px 200px 100px;
}
```

### 使用 fr 单位

```css
.grid-fr {
  display: grid;
  /* fr 表示剩余空间的分数 */
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1 的比例 */
  grid-template-rows: 100px 1fr 100px;
  height: 100vh;
}
```

### 使用 repeat() 函数

```css
.grid-repeat {
  display: grid;
  /* 重复创建相同的轨道 */
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 100px);
  
  /* 混合使用 */
  grid-template-columns: 200px repeat(2, 1fr) 200px;
}
```

### 使用 minmax() 函数

```css
.grid-minmax {
  display: grid;
  /* 最小 100px，最大 1fr */
  grid-template-columns: minmax(100px, 1fr) 200px minmax(100px, 1fr);
  grid-template-rows: minmax(50px, auto) 1fr;
}
```

### 自动填充

```css
.grid-auto-fill {
  display: grid;
  /* 自动填充，每列最小 200px */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.grid-auto-fit {
  display: grid;
  /* 自动适应，拉伸填满容器 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

## 项目定位

### 使用网格线

```css
.item-positioned {
  /* 从第 2 列线到第 4 列线 */
  grid-column-start: 2;
  grid-column-end: 4;
  
  /* 从第 1 行线到第 3 行线 */
  grid-row-start: 1;
  grid-row-end: 3;
  
  /* 简写形式 */
  grid-column: 2 / 4;
  grid-row: 1 / 3;
  
  /* 更简写的形式 */
  grid-area: 1 / 2 / 3 / 4; /* row-start / col-start / row-end / col-end */
}
```

### 使用 span 关键字

```css
.item-span {
  /* 跨越 2 列 */
  grid-column: span 2;
  
  /* 跨越 3 行 */
  grid-row: span 3;
  
  /* 从第 2 列开始，跨越 2 列 */
  grid-column: 2 / span 2;
}
```

## 命名网格线

### 定义命名线

```css
.grid-named-lines {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 200px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] 60px 
    [header-end content-start] 1fr 
    [content-end footer-start] 60px 
    [footer-end];
}

.header {
  grid-column: sidebar-start / main-end;
  grid-row: header-start / header-end;
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: content-start / content-end;
}

.main {
  grid-column: main-start / main-end;
  grid-row: content-start / content-end;
}

.footer {
  grid-column: sidebar-start / main-end;
  grid-row: footer-start / footer-end;
}
```

## 网格区域

### 使用 grid-template-areas

```css
.grid-areas {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  gap: 10px;
  height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

### 响应式网格区域

```css
.responsive-grid {
  display: grid;
  gap: 20px;
  grid-template-areas: 
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: 200px 1fr;
    grid-template-areas: 
      "header header"
      "sidebar main"
      "footer footer";
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: 200px 1fr 200px;
    grid-template-areas: 
      "header header header"
      "sidebar main aside"
      "footer footer footer";
  }
}
```

## 对齐和分布

### 容器内的对齐

```css
.grid-alignment {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
  gap: 10px;
  
  /* 整个网格在容器中的对齐 */
  justify-content: center; /* 水平对齐 */
  align-content: center;   /* 垂直对齐 */
  
  /* 可选值：start, end, center, stretch, space-around, space-between, space-evenly */
}
```

### 项目内的对齐

```css
.grid-item-alignment {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  grid-template-rows: repeat(2, 100px);
  
  /* 所有项目的默认对齐 */
  justify-items: center; /* 水平对齐 */
  align-items: center;   /* 垂直对齐 */
}

.item-custom-alignment {
  /* 单个项目的对齐 */
  justify-self: end;
  align-self: start;
}
```

## 实战案例

### 经典网页布局

```css
.page-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 80px 1fr 60px;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
  gap: 20px;
  padding: 20px;
}

.header {
  grid-area: header;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.sidebar {
  grid-area: sidebar;
  background: #f5f5f5;
  padding: 20px;
}

.main {
  grid-area: main;
  background: white;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  grid-area: footer;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
```

### 卡片网格布局

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-description {
  color: #666;
  line-height: 1.5;
}
```

### 复杂的杂志布局

```css
.magazine-layout {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 200px);
  gap: 15px;
  padding: 20px;
}

.article-main {
  grid-column: 1 / 4;
  grid-row: 1 / 3;
  background: #ff6b6b;
}

.article-secondary {
  grid-column: 4 / 7;
  grid-row: 1 / 2;
  background: #4ecdc4;
}

.article-small-1 {
  grid-column: 4 / 5;
  grid-row: 2 / 3;
  background: #45b7d1;
}

.article-small-2 {
  grid-column: 5 / 6;
  grid-row: 2 / 3;
  background: #96ceb4;
}

.article-small-3 {
  grid-column: 6 / 7;
  grid-row: 2 / 3;
  background: #feca57;
}

.article-wide {
  grid-column: 1 / 7;
  grid-row: 3 / 4;
  background: #ff9ff3;
}

.article-bottom-1 {
  grid-column: 1 / 3;
  grid-row: 4 / 5;
  background: #54a0ff;
}

.article-bottom-2 {
  grid-column: 3 / 5;
  grid-row: 4 / 5;
  background: #5f27cd;
}

.article-bottom-3 {
  grid-column: 5 / 7;
  grid-row: 4 / 5;
  background: #00d2d3;
}

.article {
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
}
```

## 高级技巧

### 子网格 (Subgrid)

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.child-grid {
  display: grid;
  grid-column: 1 / -1;
  /* 继承父网格的列定义 */
  grid-template-columns: subgrid;
  gap: inherit;
}
```

### 网格和 Flexbox 结合

```css
.hybrid-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
```

## 调试技巧

### Firefox Grid Inspector

```css
/* 在 Firefox 开发者工具中可以可视化网格 */
.debug-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 100px);
  gap: 10px;
  
  /* 临时添加边框帮助调试 */
  border: 2px solid red;
}

.debug-grid > * {
  border: 1px solid blue;
  background: rgba(0,0,255,0.1);
}
```

## 总结

CSS Grid 的核心优势：

1. **二维布局** - 同时控制行和列
2. **灵活性** - 适应各种布局需求
3. **响应式** - 轻松创建响应式设计
4. **语义化** - 使用命名区域提高可读性
5. **强大的对齐** - 精确控制项目位置

掌握 CSS Grid 将让你的布局能力提升到新的水平，能够轻松实现以前需要复杂技巧才能完成的布局。