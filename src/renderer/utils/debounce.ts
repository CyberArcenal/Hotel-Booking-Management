// src/renderer/utils/debounce.ts

import { useEffect, useMemo, useRef, useState } from "react";

type AnyFunction = (...args: any[]) => any;

/**
 * Debounce a function - delays execution until after wait ms have passed
 * @param func Function to debounce
 * @param wait Milliseconds to wait
 * @returns Debounced function with cancel method
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number
): T & { cancel: () => void; flush: (...args: Parameters<T>) => ReturnType<T> } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: any = null;
  let result: ReturnType<T> | undefined;

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    lastContext = this;
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      result = func.apply(lastContext, lastArgs!);
      lastArgs = null;
      lastContext = null;
    }, wait);

    return result;
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastContext = null;
  };

  debounced.flush = (...args: Parameters<T>): ReturnType<T> => {
    debounced.cancel();
    return func.apply(null, args.length ? args : lastArgs!);
  };

  return debounced as T & { cancel: () => void; flush: (...args: Parameters<T>) => ReturnType<T> };
}

/**
 * React hook for debouncing a value
 * @param value Value to debounce
 * @param delay Milliseconds to wait
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debouncing a function with proper cleanup
 * @param fn Function to debounce
 * @param delay Milliseconds to wait
 * @param deps Dependencies array
 * @returns Debounced function with cancel method
 */
export function useDebouncedCallback<T extends AnyFunction>(
  fn: T,
  delay: number,
  deps: any[] = []
): T & { cancel: () => void; pending: () => boolean; flush: (...args: Parameters<T>) => ReturnType<T> } {
  const fnRef = useRef<T>(fn);
  
  useEffect(() => {
    fnRef.current = fn;
  }, [fn, ...deps]);

  const debouncedFn = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;
    let lastContext: any = null;

    const debounced = function(this: any, ...args: Parameters<T>) {
      lastContext = this;
      lastArgs = args;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        fnRef.current.apply(lastContext, lastArgs!);
        lastArgs = null;
        lastContext = null;
      }, delay);
    };

    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastArgs = null;
      lastContext = null;
    };

    debounced.pending = () => timeoutId !== null;

    debounced.flush = (...args: Parameters<T>) => {
      debounced.cancel();
      return fnRef.current.apply(null, args.length ? args : lastArgs!);
    };

    return debounced as T & { 
      cancel: () => void; 
      pending: () => boolean; 
      flush: (...args: Parameters<T>) => ReturnType<T> 
    };
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
}