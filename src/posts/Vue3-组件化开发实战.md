---
title: "Vue 3 组件化开发实战"
excerpt: "深入学习 Vue 3 组件化开发技术，构建可维护的现代前端应用。"
author: "CodeBuddy"
category: "Vue"
tags: ["Vue3", "组件化", "前端开发", "TypeScript"]
publishedAt: "2024-08-30"
updatedAt: "2024-08-30"
readTime: 24
coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop"
isPublished: true
---

# Vue 3 组件化开发实战

Vue 3 带来了 Composition API、更好的 TypeScript 支持和性能提升。本文将深入探讨 Vue 3 组件化开发的最佳实践。

## 项目搭建

### 使用 Vite 创建项目

```bash
# 创建项目
npm create vue@latest my-vue-app

# 选择配置
✔ Add TypeScript? Yes
✔ Add JSX Support? Yes
✔ Add Vue Router for Single Page Application development? Yes
✔ Add Pinia for state management? Yes
✔ Add Vitest for Unit Testing? Yes
✔ Add an End-to-End Testing Solution? Cypress
✔ Add ESLint for code quality? Yes
✔ Add Prettier for code formatting? Yes

cd my-vue-app
npm install
```

### 项目结构

```
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── business/
├── composables/
├── stores/
├── views/
├── router/
├── utils/
├── types/
├── assets/
└── styles/
```

## 组件设计模式

### 基础组件

```vue
<!-- components/common/BaseButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <BaseIcon v-if="loading" name="loading" class="animate-spin mr-2" />
    <BaseIcon v-else-if="icon" :name="icon" class="mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
  block?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Variants
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': props.variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': props.variant === 'secondary',
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': props.variant === 'danger',
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500': props.variant === 'ghost',
    
    // Sizes
    'px-3 py-1.5 text-sm': props.size === 'sm',
    'px-4 py-2 text-base': props.size === 'md',
    'px-6 py-3 text-lg': props.size === 'lg',
    
    // States
    'opacity-50 cursor-not-allowed': props.disabled || props.loading,
    'w-full': props.block
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

### 表单组件

```vue
<!-- components/common/BaseInput.vue -->
<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div v-if="$slots.suffix || suffixIcon" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix">
          <BaseIcon v-if="suffixIcon" :name="suffixIcon" class="h-5 w-5 text-gray-400" />
        </slot>
      </div>
    </div>
    
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { generateId } from '@/utils/helpers'
import BaseIcon from './BaseIcon.vue'

interface Props {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  suffixIcon?: string
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md'
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const inputId = generateId('input')

const inputClasses = computed(() => [
  'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
  {
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
    'border-red-300 focus:border-red-500 focus:ring-red-500': props.error,
    'bg-gray-50 cursor-not-allowed': props.disabled,
    'bg-gray-50': props.readonly
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const focus = async () => {
  await nextTick()
  inputRef.value?.focus()
}

defineExpose({
  focus,
  inputRef
})
</script>
```

## Composition API 实践

### 自定义 Composables

```typescript
// composables/useApi.ts
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options
  
  const data: Ref<T | null> = ref(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const isSuccess = computed(() => !loading.value && !error.value && data.value !== null)
  const isError = computed(() => !loading.value && error.value !== null)
  
  const execute = async (...args: any[]) => {
    try {
      loading.value = true
      error.value = null
      
      const result = await apiFunction(...args)
      data.value = result
      
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      onError?.(errorObj)
      throw errorObj
    } finally {
      loading.value = false
    }
  }
  
  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }
  
  if (immediate) {
    execute()
  }
  
  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    isSuccess,
    isError,
    execute,
    reset
  }
}
```

### 状态管理

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, CreateUserData, UpdateUserData } from '@/types/user'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )
  
  const userCount = computed(() => users.value.length)
  
  const getUserById = computed(() => 
    (id: number) => users.value.find(user => user.id === id)
  )
  
  // Actions
  const fetchUsers = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await userApi.getUsers()
      users.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createUser = async (userData: CreateUserData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await userApi.createUser(userData)
      users.value.push(response.data)
      
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    users: readonly(users),
    currentUser: readonly(currentUser),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    activeUsers,
    userCount,
    getUserById,
    
    // Actions
    fetchUsers,
    createUser
  }
})
```

## 总结

Vue 3 组件化开发的核心要点：

1. **组件设计** - 基础组件、业务组件和复合组件
2. **Composition API** - 逻辑复用和状态管理
3. **TypeScript 集成** - 类型安全和开发体验
4. **性能优化** - 虚拟列表和懒加载
5. **测试策略** - 单元测试和集成测试

掌握这些技能将让你能够构建高质量的 Vue 3 应用。