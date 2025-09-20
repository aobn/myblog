---
title: "GraphQL API 开发"
excerpt: "深入学习 GraphQL API 开发技术，构建灵活高效的数据查询接口。"
author: "CodeBuddy"
category: "后端开发"
tags: ["GraphQL", "API", "Node.js", "数据库"]
publishedAt: "2024-07-22"
updatedAt: "2024-07-22"
readTime: 27
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop"
isPublished: true
---

# GraphQL API 开发

GraphQL 是一种用于 API 的查询语言和运行时，提供了更灵活、高效的数据获取方式。本文将深入探讨 GraphQL 的核心概念和实际应用。

## GraphQL 基础概念

### Schema 定义

```graphql
# schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  comments: [Comment!]!
  tags: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: DateTime!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts(first: Int, after: String): PostConnection!
  post(id: ID!): Post
  searchPosts(query: String!): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

type Subscription {
  postAdded: Post!
  postUpdated(id: ID!): Post!
  commentAdded(postId: ID!): Comment!
}

input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

input CreatePostInput {
  title: String!
  content: String!
  published: Boolean = false
  tags: [String!] = []
}

input UpdatePostInput {
  title: String
  content: String
  published: Boolean
  tags: [String!]
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

scalar DateTime
```

## Node.js + Apollo Server 实现

### 服务器设置

```javascript
// server.js
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const jwt = require('jsonwebtoken');

// 认证中间件
const getUser = async (token) => {
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findById(decoded.userId);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// 创建 Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await getUser(token);
    
    return {
      user,
      db: require('./db'),
      req,
    };
  },
  formatError: (error) => {
    console.error(error);
    return {
      message: error.message,
      code: error.extensions?.code,
      path: error.path,
    };
  },
});

async function startServer() {
  const app = express();
  
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});
```

### 解析器实现

```javascript
// resolvers/userResolvers.js
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userResolvers = {
  Query: {
    users: async (parent, args, { user, db }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      
      return await db.User.findAll({
        include: [{ model: db.Post, as: 'posts' }],
        order: [['createdAt', 'DESC']],
      });
    },
    
    user: async (parent, { id }, { db }) => {
      const foundUser = await db.User.findByPk(id, {
        include: [{ model: db.Post, as: 'posts' }],
      });
      
      if (!foundUser) {
        throw new UserInputError('User not found');
      }
      
      return foundUser;
    },
  },
  
  Mutation: {
    createUser: async (parent, { input }, { db }) => {
      try {
        const existingUser = await db.User.findOne({
          where: { email: input.email },
        });
        
        if (existingUser) {
          throw new UserInputError('Email already exists');
        }
        
        const user = await db.User.create(input);
        
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return {
          ...user.toJSON(),
          token,
        };
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    
    updateUser: async (parent, { id, input }, { user, db }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      
      if (user.id !== parseInt(id)) {
        throw new ForbiddenError('You can only update your own profile');
      }
      
      try {
        await db.User.update(input, { where: { id } });
        return await db.User.findByPk(id);
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  
  User: {
    posts: async (parent, args, { db }) => {
      return await db.Post.findAll({
        where: { authorId: parent.id },
        order: [['createdAt', 'DESC']],
      });
    },
  },
};

module.exports = userResolvers;
```

## 前端集成

### React + Apollo Client

```javascript
// apollo-client.js
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.log(`Network error: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
```

### React 组件示例

```javascript
// components/PostList.js
import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_POSTS = gql`
  query GetPosts($first: Int, $after: String) {
    posts(first: $first, after: $after) {
      edges {
        node {
          id
          title
          content
          published
          createdAt
          author {
            id
            name
          }
          comments {
            id
            content
            author {
              name
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      published
      createdAt
      author {
        id
        name
      }
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

function PostList() {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 10 },
    errorPolicy: 'all',
  });

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { first: 10 } }],
  });

  const [deletePost] = useMutation(DELETE_POST, {
    update(cache, { data: { deletePost } }) {
      if (deletePost) {
        cache.modify({
          fields: {
            posts(existingPosts, { readField }) {
              return {
                ...existingPosts,
                edges: existingPosts.edges.filter(
                  edge => readField('id', edge.node) !== deletePost.id
                ),
              };
            },
          },
        });
      }
    },
  });

  const handleCreatePost = async (postData) => {
    try {
      await createPost({
        variables: {
          input: postData,
        },
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost({
        variables: { id },
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const loadMore = () => {
    if (data?.posts?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.posts.pageInfo.endCursor,
        },
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Posts ({data.posts.totalCount})</h2>
      
      {data.posts.edges.map(({ node: post }) => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>By {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}</small>
          
          <div className="comments">
            <h4>Comments ({post.comments.length})</h4>
            {post.comments.map(comment => (
              <div key={comment.id} className="comment">
                <p>{comment.content}</p>
                <small>- {comment.author.name}</small>
              </div>
            ))}
          </div>
          
          <button onClick={() => handleDeletePost(post.id)}>
            Delete
          </button>
        </div>
      ))}
      
      {data.posts.pageInfo.hasNextPage && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}

export default PostList;
```

## 高级特性

### 数据加载器 (DataLoader)

```javascript
// dataLoaders.js
const DataLoader = require('dataloader');

const createLoaders = (db) => {
  const userLoader = new DataLoader(async (userIds) => {
    const users = await db.User.findAll({
      where: { id: userIds },
    });
    
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    return userIds.map(id => userMap[id] || null);
  });

  const postsByUserLoader = new DataLoader(async (userIds) => {
    const posts = await db.Post.findAll({
      where: { authorId: userIds },
    });
    
    const postsByUser = {};
    posts.forEach(post => {
      if (!postsByUser[post.authorId]) {
        postsByUser[post.authorId] = [];
      }
      postsByUser[post.authorId].push(post);
    });
    
    return userIds.map(id => postsByUser[id] || []);
  });

  return {
    userLoader,
    postsByUserLoader,
  };
};

module.exports = createLoaders;
```

### 缓存策略

```javascript
// cache-control.js
const { shield, rule, and, or } = require('graphql-shield');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// 速率限制
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (root, args, context) => context.user?.id || context.req.ip,
  points: 100, // 请求数
  duration: 60, // 每60秒
});

const rateLimit = rule({ cache: 'contextual' })(
  async (parent, args, context) => {
    try {
      await rateLimiter.consume(context.user?.id || context.req.ip);
      return true;
    } catch (rejRes) {
      return new Error('Rate limit exceeded');
    }
  }
);

// 权限规则
const isAuthenticated = rule({ cache: 'contextual' })(
  (parent, args, context) => context.user !== null
);

const isOwner = rule({ cache: 'strict' })(
  async (parent, args, context) => {
    const post = await context.db.Post.findByPk(args.id);
    return post && post.authorId === context.user.id;
  }
);

// 权限配置
const permissions = shield({
  Query: {
    users: and(isAuthenticated, rateLimit),
    posts: rateLimit,
  },
  Mutation: {
    createPost: and(isAuthenticated, rateLimit),
    updatePost: and(isAuthenticated, isOwner, rateLimit),
    deletePost: and(isAuthenticated, isOwner, rateLimit),
  },
});

module.exports = permissions;
```

## 性能优化

### 查询复杂度分析

```javascript
// query-complexity.js
const { createComplexityLimitRule } = require('graphql-query-complexity');

const complexityLimitRule = createComplexityLimitRule(1000, {
  maximumComplexity: 1000,
  variables: {},
  createError: (max, actual) => {
    return new Error(`Query is too complex: ${actual}. Maximum allowed complexity: ${max}`);
  },
  onComplete: (complexity) => {
    console.log('Query complexity:', complexity);
  },
});

// 在 Apollo Server 中使用
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [complexityLimitRule],
  // ... 其他配置
});
```

### 查询深度限制

```javascript
// depth-limit.js
const depthLimit = require('graphql-depth-limit');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(7)], // 最大深度 7
  // ... 其他配置
});
```

## 测试

### 单元测试

```javascript
// tests/resolvers.test.js
const { createTestClient } = require('apollo-server-testing');
const { ApolloServer, gql } = require('apollo-server-express');

describe('User Resolvers', () => {
  let server;
  let query, mutate;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        user: { id: 1, name: 'Test User' },
        db: mockDb,
      }),
    });

    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;
  });

  test('should fetch users', async () => {
    const GET_USERS = gql`
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `;

    const result = await query({ query: GET_USERS });
    
    expect(result.errors).toBeUndefined();
    expect(result.data.users).toHaveLength(2);
    expect(result.data.users[0]).toHaveProperty('id');
    expect(result.data.users[0]).toHaveProperty('name');
    expect(result.data.users[0]).toHaveProperty('email');
  });

  test('should create a new user', async () => {
    const CREATE_USER = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const result = await mutate({
      mutation: CREATE_USER,
      variables: {
        input: {
          name: 'New User',
          email: 'new@example.com',
        },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data.createUser).toHaveProperty('id');
    expect(result.data.createUser.name).toBe('New User');
    expect(result.data.createUser.email).toBe('new@example.com');
  });
});
```

## 总结

GraphQL API 开发的核心要点：

1. **Schema 设计** - 类型定义和关系建模
2. **解析器实现** - 数据获取和业务逻辑
3. **认证授权** - 用户认证和权限控制
4. **性能优化** - DataLoader 和缓存策略
5. **错误处理** - 统一错误处理和验证
6. **测试策略** - 单元测试和集成测试

掌握这些技能将让你能够构建高效灵活的 GraphQL API。