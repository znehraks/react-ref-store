import { useLayoutEffect, useRef } from 'react';

import type { RefsMap } from './useRefsStore';

interface UseRegisterRefOptions {
  /** 등록을 지연시킬지 여부 (기본값: true, requestAnimationFrame 사용) */
  isDefer?: boolean;
  /** 등록 활성화 여부 (기본값: true) */
  isEnabled?: boolean;
}

/**
 * DOM 요소를 Store에 등록하는 훅
 * 키별로 타입이 추론되어 타입 안전성을 보장합니다.
 *
 * @param store - RefsStore 인스턴스
 * @param key - 요소를 식별할 고유 키
 * @param options - 등록 옵션
 * @returns 등록할 DOM 요소의 ref
 *
 * @example
 * ```tsx
 * type SearchRefs = {
 *   'search-field': HTMLDivElement;
 *   'search-input': HTMLInputElement;
 * };
 *
 * const SearchRefsStore = createRefsStore<SearchRefs>();
 *
 * function SearchField() {
 *   const registry = SearchRefsStore.useStore();
 *   const ref = useRegisterRef(registry, 'search-field'); // HTMLDivElement로 추론됨
 *   return <div ref={ref}>Search Field</div>;
 * }
 * ```
 */
export function useRegisterRef<T extends Record<string, HTMLElement>, K extends keyof T>(
  store: RefsMap<T> | null,
  key: K,
  options: UseRegisterRefOptions = {},
): React.RefObject<T[K]> {
  const { isDefer = true, isEnabled = true } = options;
  const elementRef = useRef<T[K]>(null);

  useLayoutEffect(() => {
    if (!store || !isEnabled) return () => {};

    const register = () => {
      if (elementRef.current) {
        store.register(key, elementRef.current);
      }
    };

    if (isDefer) {
      const rafId = requestAnimationFrame(register);
      return () => {
        cancelAnimationFrame(rafId);
        store.unregister(key);
      };
    }
    register();
    return () => {
      store.unregister(key);
    };
  }, [store, key, isDefer, isEnabled]);

  return elementRef;
}
