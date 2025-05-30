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
 *
 * @param store - RefsStore 인스턴스
 * @param key - 요소를 식별할 고유 키
 * @param options - 등록 옵션
 * @returns 등록할 DOM 요소의 ref
 *
 * @example
 * ```tsx
 * const TabRefsStore = createRefsStore<HTMLButtonElement>();
 *
 * function Tab({ id, children }) {
 *   const registry = TabRefsStore.useRegistry();
 *   const ref = useRegisterRef(registry, id);
 *   return <button ref={ref}>{children}</button>;
 * }
 * ```
 */
export function useRegisterRef<T extends HTMLElement = HTMLElement>(
  store: RefsMap<T> | null,
  key: string,
  options: UseRegisterRefOptions = {},
) {
  const { isDefer = true, isEnabled = true } = options;
  const elementRef = useRef<T>(null);

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
