---
title: "Rust 系统编程入门"
excerpt: "深入学习 Rust 编程语言，掌握内存安全的系统级编程技能。"
author: "CodeBuddy"
category: "Rust"
tags: ["Rust", "系统编程", "内存安全", "并发编程"]
publishedAt: "2024-11-25"
updatedAt: "2024-11-25"
readTime: 25
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop"
isPublished: true
---

# Rust 系统编程入门

Rust 是一门注重安全、速度和并发的系统编程语言。本文将深入探讨 Rust 的核心概念和实践应用。

## Rust 基础概念

### 所有权系统

```rust
// 所有权规则
fn ownership_basics() {
    // 1. 每个值都有一个所有者
    let s1 = String::from("hello");
    
    // 2. 同一时间只能有一个所有者
    let s2 = s1; // s1 的所有权转移给 s2
    // println!("{}", s1); // 编译错误：s1 已失效
    
    // 3. 当所有者离开作用域时，值被丢弃
    {
        let s3 = String::from("world");
    } // s3 在此处被丢弃
    
    println!("{}", s2); // 正常工作
}

// 借用和引用
fn borrowing_example() {
    let s1 = String::from("hello");
    
    // 不可变借用
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
    
    // 可变借用
    let mut s2 = String::from("hello");
    change(&mut s2);
    println!("{}", s2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

### 错误处理

```rust
use std::fs::File;
use std::io::{self, Read};

// Result 类型的使用
fn read_file_content(filename: &str) -> Result<String, io::Error> {
    let mut file = File::open(filename)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// 自定义错误类型
#[derive(Debug)]
enum MyError {
    IoError(io::Error),
    ParseError(std::num::ParseIntError),
    CustomError(String),
}

impl From<io::Error> for MyError {
    fn from(error: io::Error) -> Self {
        MyError::IoError(error)
    }
}

impl std::fmt::Display for MyError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            MyError::IoError(e) => write!(f, "IO error: {}", e),
            MyError::ParseError(e) => write!(f, "Parse error: {}", e),
            MyError::CustomError(e) => write!(f, "Custom error: {}", e),
        }
    }
}
```

### 泛型和 Trait

```rust
// 泛型结构体
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }
}

// Trait 定义
trait Summary {
    fn summarize(&self) -> String;
}

struct NewsArticle {
    headline: String,
    author: String,
    content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {}", self.headline, self.author)
    }
}
```

## 并发编程

### 线程和消息传递

```rust
use std::thread;
use std::sync::{Arc, Mutex, mpsc};

// 基本线程创建
fn basic_threading() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from spawned thread!", i);
        }
    });
    
    handle.join().unwrap();
}

// 线程间共享数据
fn shared_data_example() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Result: {}", *counter.lock().unwrap());
}
```

## 系统编程实例

### 文件系统操作

```rust
use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Write};

struct FileManager;

impl FileManager {
    fn read_file(path: &str) -> io::Result<String> {
        fs::read_to_string(path)
    }
    
    fn write_file(path: &str, content: &str) -> io::Result<()> {
        let mut file = File::create(path)?;
        file.write_all(content.as_bytes())?;
        Ok(())
    }
    
    fn read_lines(path: &str) -> io::Result<Vec<String>> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        let mut lines = Vec::new();
        
        for line in reader.lines() {
            lines.push(line?);
        }
        
        Ok(lines)
    }
}
```

### 网络编程

```rust
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

struct TcpServer {
    addr: String,
}

impl TcpServer {
    fn new(addr: String) -> Self {
        Self { addr }
    }
    
    async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(&self.addr).await?;
        println!("Server listening on {}", self.addr);
        
        loop {
            let (socket, addr) = listener.accept().await?;
            println!("New client: {}", addr);
            
            tokio::spawn(async move {
                Self::handle_client(socket).await;
            });
        }
    }
    
    async fn handle_client(mut socket: TcpStream) {
        let mut buffer = [0; 1024];
        
        loop {
            match socket.read(&mut buffer).await {
                Ok(0) => break,
                Ok(n) => {
                    if socket.write_all(&buffer[..n]).await.is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    }
}
```

## 总结

Rust 系统编程的核心优势：

1. **内存安全** - 零成本抽象和所有权系统
2. **并发安全** - 防止数据竞争的类型系统
3. **性能优异** - 接近 C/C++ 的运行时性能
4. **现代语法** - 表达力强且易于维护

掌握 Rust 将让你能够开发高性能、安全的系统级应用程序。