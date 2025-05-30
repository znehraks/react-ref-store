import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { useRefsStore, type RefsMap } from './useRefsStore';

/**
 * DOM Registry Context와 Provider를 생성하는 함수
 *
 * @example
 * ```tsx
 * // 1. Registry 생성
 * const TabRefsStore = createRefsStore<HTMLButtonElement>();
 *
 * // 2. Provider로 감싸기
 * function TabGroup({ children }) {
 *   return (
 *     <TabRefsStore.Provider>
 *       {children}
 *     </TabRefsStore.Provider>
 *   );
 * }
 *
 * // 3. 하위 컴포넌트에서 사용
 * function Tab({ id }) {
 *   const registry = TabRefsStore.useRegistry();
 *   const ref = useRegisterRef(registry, id);
 *   return <button ref={ref}>Tab</button>;
 * }
 * ```
 */
export function createRefsStore<T extends HTMLElement = HTMLElement>() {
  const Context = createContext<RefsMap<T> | null>(null);

  function Provider({ children, refsStore: externalRefsStore }: { children: ReactNode; refsStore?: RefsMap<T> }) {
    // 외부에서 주입된 refsStore가 없으면 내부에서 생성
    const internalRefsStore = useRefsStore<T>();
    const refsStore = externalRefsStore || internalRefsStore;

    return <Context.Provider value={refsStore}>{children}</Context.Provider>;
  }

  function useStore(options?: { optional?: boolean }) {
    const refsStore = useContext(Context);

    if (!refsStore && !options?.optional) {
      throw new Error('useStore must be used within a RefsStore.Provider. If you want to use it outside, pass { optional: true } option.');
    }

    return refsStore;
  }

  return {
    Provider,
    useStore,
    // Context는 내부 구현이므로 노출하지 않음
    // 만약 Providers 통합이 필요하다면, Provider를 직접 사용하거나
    // 별도의 통합 방법을 고려하세요
  };
}
