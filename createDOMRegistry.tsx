import React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { DOMRegistry } from './useDOMRegistry';
import { useDOMRegistry } from './useDOMRegistry';

/**
 * DOM Registry Context와 Provider를 생성하는 함수
 *
 * @example
 * ```tsx
 * // 1. Registry 생성
 * const TabRegistry = createDOMRegistry<HTMLButtonElement>();
 *
 * // 2. Provider로 감싸기
 * function TabGroup({ children }) {
 *   return (
 *     <TabRegistry.Provider>
 *       {children}
 *     </TabRegistry.Provider>
 *   );
 * }
 *
 * // 3. 하위 컴포넌트에서 사용
 * function Tab({ id }) {
 *   const registry = TabRegistry.useRegistry();
 *   const ref = useDOMRegistration(registry, id);
 *   return <button ref={ref}>Tab</button>;
 * }
 * ```
 */
export function createDOMRegistry<T extends HTMLElement = HTMLElement>() {
  const Context = createContext<DOMRegistry<T> | null>(null);

  function Provider({ children, registry: externalRegistry }: { children: ReactNode; registry?: DOMRegistry<T> }) {
    // 외부에서 주입된 registry가 없으면 내부에서 생성
    const internalRegistry = useDOMRegistry<T>();
    const registry = externalRegistry || internalRegistry;

    return <Context.Provider value={registry}>{children}</Context.Provider>;
  }

  function useRegistry(options?: { optional?: boolean }) {
    const registry = useContext(Context);

    if (!registry && !options?.optional) {
      throw new Error(
        'useRegistry must be used within a DOMRegistry.Provider. If you want to use it outside, pass { optional: true } option.',
      );
    }

    return registry;
  }

  return {
    Provider,
    useRegistry,
    Context, // Providers 통합을 위해 노출
  };
}
