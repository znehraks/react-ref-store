# Refs Store

React에서 querySelector 대신 ref를 통해 DOM 요소를 관리하는 유틸리티입니다.

## 언제 사용하나요?

- 부모 컴포넌트가 자식 컴포넌트들의 DOM 요소에 접근해야 할 때
- querySelector를 사용하지 않고 React 친화적으로 DOM을 관리하고 싶을 때
- 예: 탭, 메뉴, 애니메이션 인디케이터 등

## API

### 1. `createRefsStore()`

Context와 Provider, Hook을 한 번에 생성하는 팩토리 함수입니다.

```tsx
const TabRefsStore = createRefsStore<HTMLButtonElement>();

// 반환값
{
  Provider,  // Context Provider 컴포넌트
  useStore,  // Store를 가져오는 Hook
}
```

### 2. `useRefsStore()`

ref들을 Map 자료구조로 관리하는 Store를 생성합니다. (Context 없이 단독 사용)

```tsx
function MyComponent() {
  const refsStore = useRefsStore<HTMLDivElement>();
  // Map API 사용: refsStore.get(), refsStore.has() 등
}
```

### 3. `useRegisterRef()`

DOM 요소의 ref를 Store에 등록하는 Hook입니다.

```tsx
const ref = useRegisterRef(refsStore, 'unique-key');
return <div ref={ref}>...</div>;
```

## 사용 예시

### 기본 사용법

```tsx
// 1. Store 생성
const TabRefsStore = createRefsStore<HTMLButtonElement>();

// 2. Provider로 감싸기
export function TabGroup({ children }) {
  return (
    <TabRefsStore.Provider>
      {children}
    </TabRefsStore.Provider>
  );
}

// 3. 자식 컴포넌트에서 등록
function Tab({ id, children }) {
  const store = TabRefsStore.useStore();
  const ref = useRegisterRef(store, id);
  
  return <button ref={ref}>{children}</button>;
}

// 4. Store 사용
function TabIndicator({ activeTabId }) {
  const store = TabRefsStore.useStore();
  const activeTab = store.get(activeTabId);
  
  if (!activeTab) return null;
  
  const rect = activeTab.getBoundingClientRect();
  // 위치 계산 후 인디케이터 렌더링...
}
```

### 선택적 사용 (Provider 밖에서)

```tsx
// Provider 밖에서도 사용 가능하게 하려면
const store = TabRefsStore.useStore({ optional: true });
// store가 null일 수 있음을 체크해야 함
if (store) {
  const element = store.get('tab-1');
}
```

### 직접 Store 생성

Context 없이 단독으로 사용하는 경우:

```tsx
function StandaloneComponent() {
  const refsStore = useRefsStore();
  
  // Map API 사용
  const buttonRef = refsStore.get('button-1');
  const hasTab = refsStore.has('tab-1');
  
  return <ChildComponent refsStore={refsStore} />;
}
```

## Store API (RefsMap)

```tsx
interface RefsMap<T extends HTMLElement> {
  register(key: string, element: T | null): void;   // 요소 등록
  unregister(key: string): void;                     // 요소 해제
  get(key: string): T | null;                        // 요소 가져오기
  getAll(): Map<string, T>;                          // 모든 요소 가져오기
  has(key: string): boolean;                         // 요소 존재 확인
  clear(): void;                                     // 모든 요소 제거
}
```

## 패턴 선택 가이드

- **Context가 필요한 경우**: `createRefsStore()` 사용
- **Context 없이 local하게 사용**: `useRefsStore()` 사용
- **Provider 내부에서만 사용**: `useStore()`
- **Provider 내외부 모두에서 사용**: `useStore({ optional: true })` 