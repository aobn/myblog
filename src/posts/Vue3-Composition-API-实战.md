---
title: "Vue 3 Composition API 实战"
excerpt: "深入学习 Vue 3 Composition API，掌握现代 Vue 开发的核心技能。"
author: "CodeBuddy"
category: "Vue"
tags: ["Vue", "Composition API", "前端开发"]
publishedAt: "2024-07-22"
updatedAt: "2024-07-22"
readTime: 15
coverImage: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop"
isPublished: true
---

# Vue 3 Composition API 实战

Vue 3 的 Composition API 为我们提供了更灵活的组件逻辑组织方式。本文将通过实际案例展示如何有效使用 Composition API。

## 基础概念

### setup 函数

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const title = ref('Vue 3 Demo')
    
    const increment = () => {
      count.value++
    }
    
    const doubleCount = computed(() => count.value * 2)
    
    return {
      count,
      title,
      increment,
      doubleCount
    }
  }
}
</script>
```

### script setup 语法糖

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const title = ref('Vue 3 Demo')

const increment = () => {
  count.value++
}

const doubleCount = computed(() => count.value * 2)
</script>
```

## 响应式系统

### ref vs reactive

```javascript
import { ref, reactive, toRefs } from 'vue'

// ref - 用于基本类型
const count = ref(0)
const message = ref('Hello')

// reactive - 用于对象
const state = reactive({
  user: {
    name: 'John',
    age: 30
  },
  posts: []
})

// 解构响应式对象
const { user, posts } = toRefs(state)
```

### 深度响应式

```javascript
import { reactive, ref } from 'vue'

const state = reactive({
  nested: {
    count: 0
  }
})

// 深度响应式，嵌套属性也是响应式的
state.nested.count++ // 会触发更新

// 使用 shallowReactive 创建浅层响应式
import { shallowReactive } from 'vue'

const shallowState = shallowReactive({
  nested: {
    count: 0
  }
})

// 只有根级别属性是响应式的
shallowState.nested = { count: 1 } // 会触发更新
shallowState.nested.count++ // 不会触发更新
```

## 生命周期钩子

```vue
<script setup>
import { 
  onMounted, 
  onUpdated, 
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount
} from 'vue'

onBeforeMount(() => {
  console.log('组件即将挂载')
})

onMounted(() => {
  console.log('组件已挂载')
})

onBeforeUpdate(() => {
  console.log('组件即将更新')
})

onUpdated(() => {
  console.log('组件已更新')
})

onBeforeUnmount(() => {
  console.log('组件即将卸载')
})

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

## 组合式函数

### 创建可复用的逻辑

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  const isEven = computed(() => count.value % 2 === 0)
  
  return {
    count,
    increment,
    decrement,
    reset,
    isEven
  }
}
```

### 使用组合式函数

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Is Even: {{ isEven }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment, decrement, reset, isEven } = useCounter(10)
</script>
```

## 高级用法

### 依赖注入

```javascript
// 父组件
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)

// 子组件
import { inject } from 'vue'

const theme = inject('theme')
```

### 模板引用

```vue
<template>
  <div>
    <input ref="inputRef" type="text" />
    <button @click="focusInput">Focus Input</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

const focusInput = () => {
  inputRef.value.focus()
}

onMounted(() => {
  console.log(inputRef.value) // DOM 元素
})
</script>
```

### 侦听器

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 侦听单个源
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})

// 侦听多个源
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log('Multiple values changed')
})

// 立即执行的侦听器
watchEffect(() => {
  console.log(`Count is ${count.value}`)
})

// 深度侦听
const state = ref({ nested: { count: 0 } })
watch(state, (newValue, oldValue) => {
  console.log('Deep watch triggered')
}, { deep: true })
```

## 实战案例：Todo 应用

```vue
<template>
  <div class="todo-app">
    <h1>Todo List</h1>
    
    <form @submit.prevent="addTodo">
      <input 
        v-model="newTodo" 
        placeholder="Add a todo..."
        required
      />
      <button type="submit">Add</button>
    </form>
    
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter"
        :class="{ active: currentFilter === filter }"
        @click="currentFilter = filter"
      >
        {{ filter }}
      </button>
    </div>
    
    <ul class="todo-list">
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Delete</button>
      </li>
    </ul>
    
    <p>{{ stats }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 状态
const todos = ref([])
const newTodo = ref('')
const currentFilter = ref('All')
const filters = ['All', 'Active', 'Completed']

// 计算属性
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'Active':
      return todos.value.filter(todo => !todo.completed)
    case 'Completed':
      return todos.value.filter(todo => todo.completed)
    default:
      return todos.value
  }
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(todo => todo.completed).length
  const active = total - completed
  
  return `Total: ${total}, Active: ${active}, Completed: ${completed}`
})

// 方法
const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id) => {
  const index = todos.value.findIndex(todo => todo.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}
</script>

<style scoped>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.completed span {
  text-decoration: line-through;
  opacity: 0.6;
}

.filters button {
  margin-right: 10px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.filters button.active {
  background: #007bff;
  color: white;
}
</style>
```

## 性能优化

### 使用 shallowRef

```javascript
import { shallowRef } from 'vue'

// 对于大型对象，使用 shallowRef 可以提高性能
const largeObject = shallowRef({
  // 大量数据
})

// 只有替换整个对象才会触发更新
largeObject.value = newLargeObject
```

### 使用 markRaw

```javascript
import { markRaw, reactive } from 'vue'

const state = reactive({
  // 标记为非响应式，提高性能
  thirdPartyLibrary: markRaw(someLibraryInstance)
})
```

## 总结

Vue 3 Composition API 的优势：

1. **更好的逻辑复用** - 通过组合式函数
2. **更好的类型推导** - TypeScript 支持
3. **更灵活的代码组织** - 按功能而非选项组织
4. **更好的性能** - 更精确的依赖追踪

掌握 Composition API 将让你的 Vue 3 开发更加高效和优雅。