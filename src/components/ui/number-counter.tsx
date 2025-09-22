/**
 * 数字翻页动画组件
 * 
 * @author xxh
 * @date 2025-09-23
 */

import { useState, useEffect } from 'react';

interface NumberCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function NumberCounter({ value, duration = 1000, className = '' }: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value === displayValue) {
      // 确保动画状态正确
      if (isFlipping) {
        setIsFlipping(false);
      }
      return;
    }

    setIsFlipping(true);
    
    // 翻页效果：先向上翻转，然后显示新数字
    const timer1 = setTimeout(() => {
      setDisplayValue(value);
    }, duration / 2);

    const timer2 = setTimeout(() => {
      setIsFlipping(false);
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [value, duration, displayValue, isFlipping]);

  return (
    <span 
      className={`
        ${className} inline-block font-medium transition-all duration-500 transform-gpu
        ${isFlipping 
          ? 'animate-pulse scale-110 text-primary font-bold' 
          : 'scale-100'
        }
      `}
      style={{
        textShadow: isFlipping ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
        filter: isFlipping ? 'brightness(1.2)' : 'brightness(1)'
      }}
    >
      {displayValue.toLocaleString()}
    </span>
  );
}