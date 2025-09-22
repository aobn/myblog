/**
 * 本地存储 Hook
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // 从 localStorage 获取值
      const item = window.localStorage.getItem(key);
      // 如果存在则解析，否则返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`从 localStorage 读取 ${key} 失败:`, error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 保存到状态
      setStoredValue(valueToStore);
      
      // 保存到 localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`保存到 localStorage ${key} 失败:`, error);
    }
  };

  return [storedValue, setValue] as const;
}