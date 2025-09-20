---
title: "TypeScript 高级类型系统"
excerpt: "深入探索 TypeScript 的高级类型特性，掌握类型编程的精髓。"
author: "CodeBuddy"
category: "TypeScript"
tags: ["TypeScript", "类型系统", "前端开发"]
publishedAt: "2024-12-15"
updatedAt: "2024-12-15"
readTime: 20
coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop"
isPublished: true
---

# TypeScript 高级类型系统

TypeScript 的类型系统远比表面看起来强大。本文将深入探讨高级类型特性，让你成为类型编程专家。

## 泛型进阶

### 条件类型

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

// 实用的条件类型
type NonNullable<T> = T extends null | undefined ? never : T;
type NonNull = NonNullable<string | null | undefined>; // string

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type FuncReturn = ReturnType<() => string>; // string

// 提取 Promise 的值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;
type PromiseValue = Awaited<Promise<string>>; // string
```

### 映射类型

```typescript
// 基础映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 高级映射类型
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 自定义映射类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type Stringify<T> = {
  [P in keyof T]: string;
};

interface User {
  id: number;
  name: string;
  email: string;
}

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null; }

type StringUser = Stringify<User>;
// { id: string; name: string; email: string; }
```

### 模板字面量类型

```typescript
// 基础模板字面量类型
type Greeting = `Hello, ${string}!`;
type Welcome = `Welcome, ${'user' | 'admin'}!`; // "Welcome, user!" | "Welcome, admin!"

// 实用的模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"

// 路径类型生成
type ApiPath<T extends string> = `/api/${T}`;
type UserPath = ApiPath<'users'>; // "/api/users"

// 复杂的模板类型
type CSSProperty<T extends string> = `--${T}`;
type ThemeProperty = CSSProperty<'primary-color' | 'secondary-color'>;
// "--primary-color" | "--secondary-color"

// 递归模板类型
type Join<T extends readonly string[], D extends string> = 
  T extends readonly [infer F, ...infer R]
    ? F extends string
      ? R extends readonly string[]
        ? R['length'] extends 0
          ? F
          : `${F}${D}${Join<R, D>}`
        : never
      : never
    : '';

type Path = Join<['users', 'profile', 'settings'], '/'>; // "users/profile/settings"
```

## 高级类型操作

### infer 关键字

```typescript
// 提取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type StringArray = ArrayElement<string[]>; // string

// 提取函数参数类型
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

type FuncParams = Parameters<(a: string, b: number) => void>; // [string, number]

// 提取对象值类型
type ValueOf<T> = T[keyof T];
type UserValues = ValueOf<User>; // number | string

// 复杂的 infer 使用
type GetPromiseType<T> = T extends Promise<infer U> 
  ? U extends Promise<infer V> 
    ? GetPromiseType<V>
    : U
  : T;

type NestedPromise = GetPromiseType<Promise<Promise<string>>>; // string
```

### 递归类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 路径类型
type Paths<T, K extends keyof T = keyof T> = 
  K extends string | number
    ? T[K] extends object
      ? K | `${K}.${Paths<T[K]>}`
      : K
    : never;

interface NestedObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
}

type ObjectPaths = Paths<NestedObject>;
// "user" | "user.profile" | "user.profile.name" | "user.profile.age" | "user.settings" | "user.settings.theme"
```

## 实用工具类型

### 字符串操作类型

```typescript
// 字符串转换
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

// 自定义字符串操作
type Split<S extends string, D extends string> = 
  S extends `${infer T}${D}${infer U}` 
    ? [T, ...Split<U, D>] 
    : [S];

type SplitResult = Split<'a.b.c', '.'>; // ["a", "b", "c"]

// 驼峰命名转换
type CamelCase<S extends string> = 
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
    : S;

type CamelCased = CamelCase<'hello_world_test'>; // "helloWorldTest"
```

### 数组操作类型

```typescript
// 数组长度
type Length<T extends readonly any[]> = T['length'];
type ArrayLength = Length<[1, 2, 3]>; // 3

// 数组头部
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
type FirstElement = Head<[1, 2, 3]>; // 1

// 数组尾部
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : [];
type RestElements = Tail<[1, 2, 3]>; // [2, 3]

// 数组反转
type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

type Reversed = Reverse<[1, 2, 3]>; // [3, 2, 1]

// 数组连接
type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];
type Combined = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]
```

## 类型编程实战

### 表单验证类型

```typescript
// 验证规则类型
interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

// 表单字段类型
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  rules?: ValidationRule<T>[];
};

// 表单类型生成器
type FormSchema<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// 验证结果类型
type ValidationResult<T> = {
  [K in keyof T]: {
    isValid: boolean;
    errors: string[];
  };
};

// 使用示例
interface UserForm {
  username: string;
  email: string;
  age: number;
}

type UserFormSchema = FormSchema<UserForm>;
type UserValidationResult = ValidationResult<UserForm>;

// 类型安全的表单处理器
class FormHandler<T extends Record<string, any>> {
  private schema: FormSchema<T>;
  
  constructor(initialValues: T) {
    this.schema = {} as FormSchema<T>;
    Object.keys(initialValues).forEach(key => {
      this.schema[key as keyof T] = {
        value: initialValues[key],
        touched: false,
        rules: []
      };
    });
  }
  
  setValue<K extends keyof T>(field: K, value: T[K]): void {
    this.schema[field].value = value;
    this.schema[field].touched = true;
  }
  
  validate(): ValidationResult<T> {
    const result = {} as ValidationResult<T>;
    
    Object.keys(this.schema).forEach(key => {
      const field = this.schema[key as keyof T];
      const errors: string[] = [];
      
      if (field.rules) {
        field.rules.forEach(rule => {
          if (rule.required && !field.value) {
            errors.push('This field is required');
          }
          // 更多验证逻辑...
        });
      }
      
      result[key as keyof T] = {
        isValid: errors.length === 0,
        errors
      };
    });
    
    return result;
  }
}
```

### API 类型生成器

```typescript
// HTTP 方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 端点定义
interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  params?: Record<string, any>;
  body?: any;
  response: any;
}

// API 定义
interface ApiDefinition {
  [key: string]: ApiEndpoint;
}

// 生成 API 客户端类型
type ApiClient<T extends ApiDefinition> = {
  [K in keyof T]: T[K] extends ApiEndpoint
    ? (
        params: T[K]['params'] extends undefined ? void : T[K]['params'],
        body: T[K]['body'] extends undefined ? void : T[K]['body']
      ) => Promise<T[K]['response']>
    : never;
};

// API 定义示例
interface MyApiDefinition extends ApiDefinition {
  getUser: {
    method: 'GET';
    path: '/users/:id';
    params: { id: string };
    response: { id: string; name: string; email: string };
  };
  createUser: {
    method: 'POST';
    path: '/users';
    body: { name: string; email: string };
    response: { id: string; name: string; email: string };
  };
  updateUser: {
    method: 'PUT';
    path: '/users/:id';
    params: { id: string };
    body: Partial<{ name: string; email: string }>;
    response: { id: string; name: string; email: string };
  };
}

// 生成的客户端类型
type MyApiClient = ApiClient<MyApiDefinition>;

// 实现 API 客户端
class ApiClientImpl implements MyApiClient {
  async getUser(params: { id: string }): Promise<{ id: string; name: string; email: string }> {
    const response = await fetch(`/users/${params.id}`);
    return response.json();
  }
  
  async createUser(
    params: void,
    body: { name: string; email: string }
  ): Promise<{ id: string; name: string; email: string }> {
    const response = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  }
  
  async updateUser(
    params: { id: string },
    body: Partial<{ name: string; email: string }>
  ): Promise<{ id: string; name: string; email: string }> {
    const response = await fetch(`/users/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  }
}
```

### 状态管理类型

```typescript
// 动作类型生成器
type ActionType<T extends string> = T;

// 动作创建器类型
type ActionCreator<T extends string, P = void> = P extends void
  ? () => { type: T }
  : (payload: P) => { type: T; payload: P };

// 动作映射类型
type ActionMap<M extends Record<string, any>> = {
  [Key in keyof M]: M[Key] extends undefined
    ? ActionCreator<Key & string>
    : ActionCreator<Key & string, M[Key]>;
};

// 状态更新器类型
type StateUpdater<S, A> = (state: S, action: A) => S;

// 示例：计数器状态管理
interface CounterState {
  count: number;
  loading: boolean;
}

interface CounterActionPayloads {
  increment: undefined;
  decrement: undefined;
  set: number;
  setLoading: boolean;
}

type CounterActions = ActionMap<CounterActionPayloads>;
type CounterAction = ReturnType<CounterActions[keyof CounterActions]>;

// 类型安全的 reducer
const counterReducer: StateUpdater<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'set':
      return { ...state, count: action.payload };
    case 'setLoading':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// 动作创建器
const counterActions: CounterActions = {
  increment: () => ({ type: 'increment' }),
  decrement: () => ({ type: 'decrement' }),
  set: (payload: number) => ({ type: 'set', payload }),
  setLoading: (payload: boolean) => ({ type: 'setLoading', payload })
};
```

## 性能优化

### 类型计算优化

```typescript
// 避免深度递归
type SafeDeepReadonly<T, Depth extends number = 5> = 
  Depth extends 0 
    ? T
    : {
        readonly [P in keyof T]: T[P] extends object 
          ? SafeDeepReadonly<T[P], Prev<Depth>>
          : T[P];
      };

type Prev<T extends number> = T extends 5 ? 4
  : T extends 4 ? 3
  : T extends 3 ? 2
  : T extends 2 ? 1
  : T extends 1 ? 0
  : never;

// 使用联合类型而不是条件类型
type FastPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 缓存复杂类型计算
type ComplexType<T> = T extends string ? 'string'
  : T extends number ? 'number'
  : T extends boolean ? 'boolean'
  : 'unknown';

// 使用类型别名缓存结果
type CachedComplexType<T> = ComplexType<T>;
```

## 总结

TypeScript 高级类型系统的核心概念：

1. **条件类型** - 基于类型条件的类型选择
2. **映射类型** - 基于现有类型创建新类型
3. **模板字面量类型** - 字符串类型的模板操作
4. **递归类型** - 处理嵌套结构
5. **类型编程** - 将类型作为程序来编写

掌握这些高级特性，将让你能够构建更加类型安全和表达力强的 TypeScript 应用。