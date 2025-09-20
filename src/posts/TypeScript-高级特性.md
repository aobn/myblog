---
title: "TypeScript 高级特性"
excerpt: "深入探索 TypeScript 的高级特性和类型系统，提升代码质量和开发效率。"
author: "CodeBuddy"
category: "前端开发"
tags: ["TypeScript", "类型系统", "泛型", "装饰器"]
publishedAt: "2024-09-12"
updatedAt: "2024-09-12"
readTime: 28
coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop"
isPublished: true
---

# TypeScript 高级特性

TypeScript 作为 JavaScript 的超集，提供了强大的类型系统和现代化的语言特性。本文将深入探讨 TypeScript 的高级特性和最佳实践。

## 高级类型系统

### 联合类型和交叉类型

```typescript
// 联合类型 (Union Types)
type Status = 'loading' | 'success' | 'error' | 'idle'
type ID = string | number

interface User {
  id: ID
  name: string
  status: Status
}

// 交叉类型 (Intersection Types)
interface Timestamped {
  createdAt: Date
  updatedAt: Date
}

interface Auditable {
  createdBy: string
  updatedBy: string
}

type AuditableEntity = Timestamped & Auditable

interface Post extends AuditableEntity {
  id: string
  title: string
  content: string
}

// 复杂的联合类型
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' }

// 类型守卫函数
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is { status: 'success'; data: T } {
  return response.status === 'success'
}

function isErrorResponse<T>(
  response: ApiResponse<T>
): response is { status: 'error'; error: string } {
  return response.status === 'error'
}

// 使用示例
async function handleApiResponse<T>(response: ApiResponse<T>) {
  if (isSuccessResponse(response)) {
    console.log('Data:', response.data) // TypeScript 知道这里有 data 属性
  } else if (isErrorResponse(response)) {
    console.error('Error:', response.error) // TypeScript 知道这里有 error 属性
  } else {
    console.log('Loading...') // status 是 'loading'
  }
}
```

### 条件类型和映射类型

```typescript
// 条件类型 (Conditional Types)
type NonNullable<T> = T extends null | undefined ? never : T

type ApiResult<T> = T extends string 
  ? { message: T }
  : T extends number
  ? { code: T }
  : { data: T }

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never
type StringOrNumberArray = ToArray<string | number> // string[] | number[]

// 映射类型 (Mapped Types)
type Partial<T> = {
  [P in keyof T]?: T[P]
}

type Required<T> = {
  [P in keyof T]-?: T[P]
}

type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// 自定义映射类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

interface Person {
  id: number
  name: string
  email: string
  age: number
}

type PersonStringKeys = StringKeys<Person> // 'name' | 'email'

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`
type ButtonEvents = EventName<'click' | 'hover' | 'focus'> // 'onClick' | 'onHover' | 'onFocus'

// 键重映射
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type PersonGetters = Getters<Person>
// {
//   getId: () => number
//   getName: () => string
//   getEmail: () => string
//   getAge: () => number
// }
```

### 工具类型

```typescript
// 内置工具类型的高级用法
interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user' | 'guest'
  profile: {
    avatar: string
    bio: string
    preferences: {
      theme: 'light' | 'dark'
      language: string
    }
  }
}

// Pick - 选择特定属性
type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>

// Omit - 排除特定属性
type UserWithoutPassword = Omit<User, 'password'>

// Record - 创建记录类型
type UserRoles = Record<'admin' | 'user' | 'guest', string[]>
const rolePermissions: UserRoles = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
}

// Extract - 提取联合类型中的特定类型
type AdminOrUser = Extract<User['role'], 'admin' | 'user'>

// Exclude - 排除联合类型中的特定类型
type NonGuestRoles = Exclude<User['role'], 'guest'>

// ReturnType - 获取函数返回类型
function createUser(data: Omit<User, 'id'>): User {
  return {
    id: Math.random().toString(36),
    ...data
  }
}

type CreateUserReturn = ReturnType<typeof createUser> // User

// Parameters - 获取函数参数类型
type CreateUserParams = Parameters<typeof createUser> // [Omit<User, 'id'>]

// 自定义工具类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

type PartialUser = DeepPartial<User>
// 所有属性都是可选的，包括嵌套对象的属性

// 路径类型
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
    }[Extract<keyof T, string>]

type UserPaths = PathsToStringProps<User>
// ['name'] | ['email'] | ['profile', 'avatar'] | ['profile', 'bio'] | ...
```

## 泛型编程

### 高级泛型

```typescript
// 泛型约束
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

// 使用类型参数约束其他类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 泛型类
class GenericRepository<T, K extends keyof T> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  findById(id: T[K]): T | undefined {
    return this.items.find(item => item[id] === id)
  }

  findBy(key: K, value: T[K]): T[] {
    return this.items.filter(item => item[key] === value)
  }

  update(id: T[K], updates: Partial<T>): T | undefined {
    const index = this.items.findIndex(item => item[id] === id)
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates }
      return this.items[index]
    }
    return undefined
  }

  delete(id: T[K]): boolean {
    const index = this.items.findIndex(item => item[id] === id)
    if (index !== -1) {
      this.items.splice(index, 1)
      return true
    }
    return false
  }

  getAll(): T[] {
    return [...this.items]
  }
}

// 使用泛型类
interface Product {
  id: string
  name: string
  price: number
  category: string
}

const productRepo = new GenericRepository<Product, 'id'>()
productRepo.add({ id: '1', name: 'Laptop', price: 999, category: 'Electronics' })
const product = productRepo.findById('1')

// 高级泛型函数
function pipe<T>(...fns: Array<(arg: T) => T>): (value: T) => T {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

function compose<T>(...fns: Array<(arg: T) => T>): (value: T) => T {
  return (value: T) => fns.reduceRight((acc, fn) => fn(acc), value)
}

// 函数重载与泛型
function createApiClient<T = any>(baseURL: string): ApiClient<T>
function createApiClient<T = any>(config: ApiConfig): ApiClient<T>
function createApiClient<T = any>(baseURLOrConfig: string | ApiConfig): ApiClient<T> {
  const config = typeof baseURLOrConfig === 'string' 
    ? { baseURL: baseURLOrConfig }
    : baseURLOrConfig
  
  return new ApiClient<T>(config)
}

interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

class ApiClient<T = any> {
  constructor(private config: ApiConfig) {}

  async get<R = T>(url: string): Promise<R> {
    // 实现 GET 请求
    return {} as R
  }

  async post<R = T, D = any>(url: string, data: D): Promise<R> {
    // 实现 POST 请求
    return {} as R
  }

  async put<R = T, D = any>(url: string, data: D): Promise<R> {
    // 实现 PUT 请求
    return {} as R
  }

  async delete<R = T>(url: string): Promise<R> {
    // 实现 DELETE 请求
    return {} as R
  }
}
```

### 类型推断

```typescript
// 类型推断增强
function createState<T>(initialState: T) {
  let state = initialState

  return {
    get: () => state,
    set: (newState: T) => {
      state = newState
    },
    update: (updater: (prevState: T) => T) => {
      state = updater(state)
    }
  }
}

// TypeScript 自动推断类型
const counterState = createState(0) // 推断为 number
const userState = createState({ name: '', email: '' }) // 推断为 { name: string, email: string }

// 条件类型推断
type Flatten<T> = T extends (infer U)[] ? U : T

type StringArray = Flatten<string[]> // string
type NumberType = Flatten<number> // number

// 函数参数推断
type GetFirstParam<T> = T extends (first: infer F, ...args: any[]) => any ? F : never

function example(a: string, b: number, c: boolean): void {}
type FirstParam = GetFirstParam<typeof example> // string

// Promise 类型推断
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

type StringPromise = UnwrapPromise<Promise<string>> // string
type NumberType2 = UnwrapPromise<number> // number

// 复杂的类型推断
type EventMap = {
  click: { x: number; y: number }
  keypress: { key: string }
  focus: {}
}

type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void

function addEventListener<T extends keyof EventMap>(
  eventType: T,
  handler: EventHandler<T>
): void {
  // 实现事件监听
}

// TypeScript 会推断正确的事件类型
addEventListener('click', (event) => {
  console.log(event.x, event.y) // event 被推断为 { x: number; y: number }
})

addEventListener('keypress', (event) => {
  console.log(event.key) // event 被推断为 { key: string }
})
```

## 装饰器

### 类装饰器

```typescript
// 启用装饰器支持需要在 tsconfig.json 中设置
// "experimentalDecorators": true
// "emitDecoratorMetadata": true

// 类装饰器
function Entity(tableName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      tableName = tableName
      
      save() {
        console.log(`Saving to table: ${tableName}`)
      }
      
      static findAll() {
        console.log(`Finding all from table: ${tableName}`)
        return []
      }
    }
  }
}

// 日志装饰器
function Loggable(target: any) {
  const originalMethods = Object.getOwnPropertyNames(target.prototype)
  
  originalMethods.forEach(methodName => {
    if (methodName !== 'constructor') {
      const originalMethod = target.prototype[methodName]
      
      if (typeof originalMethod === 'function') {
        target.prototype[methodName] = function (...args: any[]) {
          console.log(`Calling ${methodName} with args:`, args)
          const result = originalMethod.apply(this, args)
          console.log(`${methodName} returned:`, result)
          return result
        }
      }
    }
  })
}

@Entity('users')
@Loggable
class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  getName(): string {
    return this.name
  }

  setName(name: string): void {
    this.name = name
  }
}
```

### 方法装饰器

```typescript
// 方法装饰器
function Measure(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = originalMethod.apply(this, args)
    const end = performance.now()
    console.log(`${propertyName} took ${end - start} milliseconds`)
    return result
  }
}

// 缓存装饰器
function Cache(ttl: number = 60000) {
  const cache = new Map<string, { value: any; expiry: number }>()

  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const key = `${propertyName}_${JSON.stringify(args)}`
      const cached = cache.get(key)

      if (cached && cached.expiry > Date.now()) {
        console.log(`Cache hit for ${propertyName}`)
        return cached.value
      }

      const result = originalMethod.apply(this, args)
      cache.set(key, { value: result, expiry: Date.now() + ttl })
      console.log(`Cache miss for ${propertyName}`)
      return result
    }
  }
}

// 验证装饰器
function Validate(validator: (value: any) => boolean, message: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      for (const arg of args) {
        if (!validator(arg)) {
          throw new Error(`Validation failed for ${propertyName}: ${message}`)
        }
      }
      return originalMethod.apply(this, args)
    }
  }
}

class Calculator {
  @Measure
  @Cache(30000)
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }

  @Validate((x: number) => typeof x === 'number' && x > 0, 'Must be a positive number')
  sqrt(x: number): number {
    return Math.sqrt(x)
  }
}
```

### 属性装饰器

```typescript
// 属性装饰器
function Column(options: { type?: string; nullable?: boolean; default?: any } = {}) {
  return function (target: any, propertyKey: string) {
    const columns = Reflect.getMetadata('columns', target) || []
    columns.push({
      propertyKey,
      ...options
    })
    Reflect.defineMetadata('columns', columns, target)
  }
}

function PrimaryKey(target: any, propertyKey: string) {
  Reflect.defineMetadata('primaryKey', propertyKey, target)
}

// 验证装饰器
function IsEmail(target: any, propertyKey: string) {
  const validators = Reflect.getMetadata('validators', target) || {}
  validators[propertyKey] = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }
  Reflect.defineMetadata('validators', validators, target)
}

function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    const validators = Reflect.getMetadata('validators', target) || {}
    validators[propertyKey] = (value: string) => value.length >= length
    Reflect.defineMetadata('validators', validators, target)
  }
}

class UserEntity {
  @PrimaryKey
  @Column({ type: 'varchar', nullable: false })
  id!: string

  @Column({ type: 'varchar', nullable: false })
  @MinLength(2)
  name!: string

  @Column({ type: 'varchar', nullable: false })
  @IsEmail
  email!: string

  @Column({ type: 'datetime', default: () => new Date() })
  createdAt!: Date

  validate(): boolean {
    const validators = Reflect.getMetadata('validators', this) || {}
    
    for (const [property, validator] of Object.entries(validators)) {
      const value = (this as any)[property]
      if (!validator(value)) {
        console.error(`Validation failed for ${property}`)
        return false
      }
    }
    
    return true
  }
}
```

## 模块系统

### 高级模块模式

```typescript
// 命名空间
namespace Database {
  export interface Connection {
    host: string
    port: number
    database: string
  }

  export class MySQL implements Connection {
    constructor(
      public host: string,
      public port: number,
      public database: string
    ) {}

    connect(): Promise<void> {
      console.log(`Connecting to MySQL at ${this.host}:${this.port}`)
      return Promise.resolve()
    }
  }

  export class PostgreSQL implements Connection {
    constructor(
      public host: string,
      public port: number,
      public database: string
    ) {}

    connect(): Promise<void> {
      console.log(`Connecting to PostgreSQL at ${this.host}:${this.port}`)
      return Promise.resolve()
    }
  }

  export function createConnection(
    type: 'mysql' | 'postgresql',
    config: Connection
  ): MySQL | PostgreSQL {
    switch (type) {
      case 'mysql':
        return new MySQL(config.host, config.port, config.database)
      case 'postgresql':
        return new PostgreSQL(config.host, config.port, config.database)
      default:
        throw new Error(`Unsupported database type: ${type}`)
    }
  }
}

// 模块增强
declare global {
  interface Array<T> {
    chunk(size: number): T[][]
    unique(): T[]
  }
}

Array.prototype.chunk = function <T>(this: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < this.length; i += size) {
    chunks.push(this.slice(i, i + size))
  }
  return chunks
}

Array.prototype.unique = function <T>(this: T[]): T[] {
  return [...new Set(this)]
}

// 条件模块导入
type Environment = 'development' | 'production' | 'test'

interface Config {
  apiUrl: string
  debug: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

const configs: Record<Environment, Config> = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    logLevel: 'debug'
  },
  production: {
    apiUrl: 'https://api.example.com',
    debug: false,
    logLevel: 'error'
  },
  test: {
    apiUrl: 'http://localhost:3001/api',
    debug: true,
    logLevel: 'warn'
  }
}

export function getConfig(env: Environment = 'development'): Config {
  return configs[env]
}

// 动态导入类型
type ModuleLoader<T> = () => Promise<{ default: T }>

class LazyLoader<T> {
  private module: T | null = null
  private loading: Promise<T> | null = null

  constructor(private loader: ModuleLoader<T>) {}

  async load(): Promise<T> {
    if (this.module) {
      return this.module
    }

    if (this.loading) {
      return this.loading
    }

    this.loading = this.loader().then(m => {
      this.module = m.default
      this.loading = null
      return this.module
    })

    return this.loading
  }
}

// 使用示例
const heavyModule = new LazyLoader(() => import('./heavy-module'))

async function useHeavyModule() {
  const module = await heavyModule.load()
  // 使用模块
}
```

## 类型安全的 API 设计

### REST API 类型定义

```typescript
// API 响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 用户相关类型
interface User {
  id: string
  username: string
  email: string
  profile: UserProfile
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
}

interface CreateUserRequest {
  username: string
  email: string
  password: string
  profile: Omit<UserProfile, 'avatar'>
}

interface UpdateUserRequest {
  username?: string
  email?: string
  profile?: Partial<UserProfile>
}

// API 端点类型
interface ApiEndpoints {
  // 用户相关
  'GET /users': {
    query?: {
      page?: number
      limit?: number
      search?: string
    }
    response: PaginatedResponse<User>
  }
  
  'GET /users/:id': {
    params: { id: string }
    response: ApiResponse<User>
  }
  
  'POST /users': {
    body: CreateUserRequest
    response: ApiResponse<User>
  }
  
  'PUT /users/:id': {
    params: { id: string }
    body: UpdateUserRequest
    response: ApiResponse<User>
  }
  
  'DELETE /users/:id': {
    params: { id: string }
    response: ApiResponse<void>
  }
}

// 类型安全的 API 客户端
class TypedApiClient {
  constructor(private baseUrl: string) {}

  async request<
    TEndpoint extends keyof ApiEndpoints,
    TConfig extends ApiEndpoints[TEndpoint]
  >(
    endpoint: TEndpoint,
    config?: {
      params?: TConfig extends { params: infer P } ? P : never
      query?: TConfig extends { query: infer Q } ? Q : never
      body?: TConfig extends { body: infer B } ? B : never
    }
  ): Promise<TConfig extends { response: infer R } ? R : never> {
    const [method, path] = (endpoint as string).split(' ')
    
    let url = `${this.baseUrl}${path}`
    
    // 替换路径参数
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value))
      })
    }
    
    // 添加查询参数
    if (config?.query) {
      const searchParams = new URLSearchParams()
      Object.entries(config.query).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      url += `?${searchParams.toString()}`
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: config?.body ? JSON.stringify(config.body) : undefined
    })
    
    return response.json()
  }
}

// 使用示例
const api = new TypedApiClient('https://api.example.com')

async function example() {
  // TypeScript 会提供完整的类型检查和自动补全
  const users = await api.request('GET /users', {
    query: { page: 1, limit: 10, search: 'john' }
  })
  
  const user = await api.request('GET /users/:id', {
    params: { id: '123' }
  })
  
  const newUser = await api.request('POST /users', {
    body: {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  })
}
```

## 总结

TypeScript 高级特性的核心要点：

1. **高级类型系统** - 联合类型、交叉类型、条件类型和映射类型
2. **泛型编程** - 类型约束、类型推断和高级泛型模式
3. **装饰器** - 类、方法、属性装饰器的实际应用
4. **模块系统** - 命名空间、模块增强和动态导入
5. **类型安全设计** - API 类型定义和类型安全的客户端设计

掌握这些高级特性将大大提升你的 TypeScript 开发能力和代码质量。