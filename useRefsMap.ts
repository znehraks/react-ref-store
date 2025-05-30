import { useRef, useCallback } from 'react';

export interface RefsMap<T extends HTMLElement = HTMLElement> {
  register: (key: string, element: T | null) => void;
  unregister: (key: string) => void;
  get: (key: string) => T | null;
  getAll: () => Map<string, T>;
  has: (key: string) => boolean;
  clear: () => void;
}

/**
 * DOM 요소들을 key-value 형태로 관리하는 범용 레지스트리 훅
 * querySelector 대신 React 친화적인 방식으로 DOM 요소에 접근할 수 있습니다.
 *
 * @example
 * ```tsx
 * const tabRegistry = useDOMRegistry<HTMLButtonElement>();
 * const menuRegistry = useDOMRegistry<HTMLDivElement>();
 * ```
 */
export function useRefsMap<T extends HTMLElement = HTMLElement>(): RefsMap<T> {
  const elementsMap = useRef<Map<string, T>>(new Map());

  const register = useCallback((key: string, element: T | null) => {
    if (element) {
      elementsMap.current.set(key, element);
    } else {
      elementsMap.current.delete(key);
    }
  }, []);

  const unregister = useCallback((key: string) => {
    elementsMap.current.delete(key);
  }, []);

  const get = useCallback((key: string) => {
    return elementsMap.current.get(key) || null;
  }, []);

  const getAll = useCallback(() => {
    return new Map(elementsMap.current);
  }, []);

  const has = useCallback((key: string) => {
    return elementsMap.current.has(key);
  }, []);

  const clear = useCallback(() => {
    elementsMap.current.clear();
  }, []);

  return {
    register,
    unregister,
    get,
    getAll,
    has,
    clear,
  };
}
