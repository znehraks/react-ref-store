import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { useRefsStore, type RefsMap } from './useRefsStore';

/**
 * DOM Registry Context와 Provider를 생성하는 함수
 * 키별로 다른 타입의 DOM 요소를 타입 안전하게 관리할 수 있습니다.
 *
 * @example
 * ```tsx
 * // 1. 타입 정의
 * type TabRefs = {
 *   'tab-button': HTMLButtonElement;
 *   'tab-panel': HTMLDivElement;
 * };
 *
 * // 2. Registry 생성
 * const TabRefsStore = createRefsStore<TabRefs>();
 *
 * // 3. Provider로 감싸기
 * function TabGroup({ children }) {
 *   return (
 *     <TabRefsStore.Provider>
 *       {children}
 *     </TabRefsStore.Provider>
 *   );
 * }
 *
 * // 4. 하위 컴포넌트에서 사용
 * function Tab({ id }) {
 *   const registry = TabRefsStore.useStore();
 *   const ref = useRegisterRef(registry, 'tab-button');
 *   return <button ref={ref}>Tab</button>;
 * }
 * ```
 */
export function createRefsStore<T extends Record<string, HTMLElement>>() {
  const Context = createContext<RefsMap<T> | undefined>(undefined);

  function Provider({ children, refsStore: externalRefsStore }: { children: ReactNode; refsStore?: RefsMap<T> }) {
    // 외부에서 주입된 refsStore가 없으면 내부에서 생성
    const internalRefsStore = useRefsStore<T>();
    const refsStore = externalRefsStore || internalRefsStore;

    return <Context.Provider value={refsStore}>{children}</Context.Provider>;
  }

  function useStore() {
    const refsStore = useContext(Context);
    if (!refsStore) {
      throw new Error('useStore must be used within a RefsStore.Provider');
    }
    return refsStore;
  }

  return {
    Provider,
    useStore,
  };
}
