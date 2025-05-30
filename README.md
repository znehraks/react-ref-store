# DOM Registry

React에서 querySelector 대신 ref를 통해 DOM 요소를 관리하는 유틸리티입니다.

## 언제 사용하나요?

- 부모 컴포넌트가 자식 컴포넌트들의 DOM 요소에 접근해야 할 때
- querySelector를 사용하지 않고 React 친화적으로 DOM을 관리하고 싶을 때
- 예: 탭, 메뉴, 애니메이션 인디케이터 등

## API

### 1. `createDOMRegistry()`

관련된 모든 기능을 한 번에 생성하는 팩토리 함수입니다.

```tsx
const TabRegistry = createDOMRegistry<HTMLButtonElement>();

// 반환값
{
  Provider,    // Context Provider
  useRegistry, // Registry를 가져오는 Hook
  Context,     // React Context (Providers 통합용)
}
```

### 2. `useDOMRegistry()`

단독으로 Registry를 생성할 때 사용합니다. (Context 없이)

```tsx
function MyComponent() {
  const registry = useDOMRegistry<HTMLDivElement>();
  // registry를 props로 전달하거나 직접 사용
}
```

### 3. `useDOMRegistration()`

DOM 요소를 Registry에 등록하는 Hook입니다.

```tsx
const ref = useDOMRegistration(registry, 'unique-key');
return <div ref={ref}>...</div>;
```

## 사용 예시

### 기본 사용법

```tsx
// 1. Registry 생성
const TabRegistry = createDOMRegistry<HTMLButtonElement>();

// 2. Provider로 감싸기
export function TabGroup({ children }) {
  return (
    <TabRegistry.Provider>
      {children}
    </TabRegistry.Provider>
  );
}

// 3. 자식 컴포넌트에서 등록
function Tab({ id, children }) {
  const registry = TabRegistry.useRegistry();
  const ref = useDOMRegistration(registry, id);
  
  return <button ref={ref}>{children}</button>;
}

// 4. Registry 사용
function TabIndicator({ activeTabId }) {
  const registry = TabRegistry.useRegistry();
  const activeTab = registry.get(activeTabId);
  
  if (!activeTab) return null;
  
  const rect = activeTab.getBoundingClientRect();
  // 위치 계산 후 인디케이터 렌더링...
}
```

### 선택적 사용 (Provider 밖에서)

```tsx
// Provider 밖에서도 사용 가능하게 하려면
const registry = TabRegistry.useRegistry({ optional: true });
// registry가 null일 수 있음을 체크해야 함
```

### 직접 Registry 생성

Context 없이 단독으로 사용하는 경우:

```tsx
function StandaloneComponent() {
  const registry = useDOMRegistry();
  
  // registry를 직접 사용하거나 props로 전달
  return <ChildComponent registry={registry} />;
}
```

## 패턴 선택 가이드

- **Context가 필요한 경우**: `createDOMRegistry()` 사용
- **Context 없이 local하게 사용**: `useDOMRegistry()` 사용
- **Provider 내부에서만 사용**: `useRegistry()`
- **Provider 내외부 모두에서 사용**: `useRegistry({ optional: true })` 