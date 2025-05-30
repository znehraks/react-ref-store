import { useLayoutEffect, useRef } from 'react';

import type { DOMRegistry } from './useDOMRegistry';

interface UseDOMRegistrationOptions {
  /** 등록을 지연시킬지 여부 (기본값: true, requestAnimationFrame 사용) */
  isDefer?: boolean;
  /** 등록 활성화 여부 (기본값: true) */
  isEnabled?: boolean;
}

/**
 * DOM 요소를 Registry에 등록하는 훅
 *
 * @param registry - DOMRegistry 인스턴스
 * @param key - 요소를 식별할 고유 키
 * @param options - 등록 옵션
 * @returns 등록할 DOM 요소의 ref
 *
 * @example
 * ```tsx
 * const TabRegistry = createDOMRegistry<HTMLButtonElement>();
 *
 * function Tab({ id, children }) {
 *   const registry = TabRegistry.useRegistry();
 *   const ref = useDOMRegistration(registry, id);
 *   return <button ref={ref}>{children}</button>;
 * }
 * ```
 */
export function useDOMRegistration<T extends HTMLElement = HTMLElement>(
  registry: DOMRegistry<T> | null,
  key: string,
  options: UseDOMRegistrationOptions = {},
) {
  const { isDefer = true, isEnabled = true } = options;
  const elementRef = useRef<T>(null);

  useLayoutEffect(() => {
    if (!registry || !isEnabled) return () => {};

    const register = () => {
      if (elementRef.current) {
        registry.register(key, elementRef.current);
      }
    };

    if (isDefer) {
      const rafId = requestAnimationFrame(register);
      return () => {
        cancelAnimationFrame(rafId);
        registry.unregister(key);
      };
    }
    register();
    return () => {
      registry.unregister(key);
    };
  }, [registry, key, isDefer, isEnabled]);

  return elementRef;
}
