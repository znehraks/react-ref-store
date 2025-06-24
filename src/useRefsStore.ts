import { useRef, useCallback, useMemo } from 'react';

// 키별 타입 매핑을 위한 제네릭 타입
export type RefsMap<T extends Record<string, HTMLElement>> = {
  register: <K extends keyof T>(key: K, element: T[K] | undefined) => void;
  unregister: <K extends keyof T>(key: K) => void;
  get: <K extends keyof T>(key: K) => T[K] | undefined;
  has: <K extends keyof T>(key: K) => boolean;
  clear: () => void;
};

/**
 * DOM 요소들을 key-value 형태로 관리하는 범용 레지스트리 훅
 * 키별로 다른 타입의 DOM 요소를 타입 안전하게 관리할 수 있습니다.
 *
 * @example
 * ```tsx
 * type SearchRefs = {
 *   'search-field': HTMLDivElement;
 *   'search-input': HTMLInputElement;
 * };
 *
 * const searchRefsStore = useRefsStore<SearchRefs>();
 * ```
 */
export function useRefsStore<T extends Record<string, HTMLElement>>(): RefsMap<T> {
  const elementsMap = useRef<Map<keyof T, HTMLElement>>(new Map());

  const register = useCallback(<K extends keyof T>(key: K, element: T[K] | undefined) => {
    if (element) {
      elementsMap.current.set(key, element);
    } else {
      elementsMap.current.delete(key);
    }
  }, []);

  const unregister = useCallback(<K extends keyof T>(key: K) => {
    elementsMap.current.delete(key);
  }, []);

  const get = useCallback(<K extends keyof T>(key: K): T[K] | undefined => {
    return elementsMap.current.get(key) as T[K] | undefined;
  }, []);

  const has = useCallback(<K extends keyof T>(key: K): boolean => {
    return elementsMap.current.has(key);
  }, []);

  const clear = useCallback(() => {
    elementsMap.current.clear();
  }, []);

  return useMemo(
    () => ({
      register,
      unregister,
      get,
      has,
      clear,
    }),
    [register, unregister, get, has, clear],
  );
}
