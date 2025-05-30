<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/znehraks/react-ref-store/main/assets/images/react-refs-store-logo.png" alt="React Ref Store Logo" width="280" />
  <br />
  <br />
  
  <h1>React Ref Store</h1>
  
  <p>
    <strong>A React utility for managing DOM elements through refs instead of querySelector</strong>
  </p>
  
  <p>
    <a href="https://www.npmjs.com/package/react-ref-store">
      <img src="https://img.shields.io/npm/v/react-ref-store" alt="npm version" />
    </a>
    <a href="https://github.com/znehraks/react-ref-store/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/react-ref-store" alt="license" />
    </a>
    <a href="https://www.npmjs.com/package/react-ref-store">
      <img src="https://img.shields.io/npm/dm/react-ref-store" alt="downloads" />
    </a>
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript" />
  </p>
</div>

<br />

## 📦 Installation

```bash
npm install react-ref-store
# or
pnpm add react-ref-store
# or
yarn add react-ref-store
```

## 🤔 When to Use

- When parent components need to access DOM elements of child components
- When you want to manage DOM in a React-friendly way without using querySelector
- Examples: tabs, menus, animation indicators, etc.

## 📖 API

### 1. `createRefsStore()`

A factory function that creates Context, Provider, and Hook all at once.

```tsx
const TabRefsStore = createRefsStore<HTMLButtonElement>();

// Returns
{
  Provider,  // Context Provider component
  useStore,  // Hook to get the store
}
```

### 2. `useRefsStore()`

Creates a store that manages refs as a Map data structure. (Can be used standalone without Context)

```tsx
function MyComponent() {
  const refsStore = useRefsStore<HTMLDivElement>();
  // Use Map API: refsStore.get(), refsStore.has(), etc.
}
```

### 3. `useRegisterRef()`

A hook that registers a DOM element's ref to the Store.

```tsx
const ref = useRegisterRef(refsStore, 'unique-key');
return <div ref={ref}>...</div>;
```

## 💡 Usage Examples

### Basic Usage

```tsx
// 1. Create Store
const TabRefsStore = createRefsStore<HTMLButtonElement>();

// 2. Wrap with Provider
export function TabGroup({ children }) {
  return (
    <TabRefsStore.Provider>
      {children}
    </TabRefsStore.Provider>
  );
}

// 3. Register in child components
function Tab({ id, children }) {
  const store = TabRefsStore.useStore();
  const ref = useRegisterRef(store, id);
  
  return <button ref={ref}>{children}</button>;
}

// 4. Use the Store
function TabIndicator({ activeTabId }) {
  const store = TabRefsStore.useStore();
  const activeTab = store.get(activeTabId);
  
  if (!activeTab) return null;
  
  const rect = activeTab.getBoundingClientRect();
  // Calculate position and render indicator...
}
```

### Optional Usage (Outside Provider)

```tsx
// To use outside Provider
const store = TabRefsStore.useStore({ optional: true });
// Need to check if store is null
if (store) {
  const element = store.get('tab-1');
}
```

### Direct Store Creation

When using standalone without Context:

```tsx
function StandaloneComponent() {
  const refsStore = useRefsStore();
  
  // Use Map API
  const buttonRef = refsStore.get('button-1');
  const hasTab = refsStore.has('tab-1');
  
  return <ChildComponent refsStore={refsStore} />;
}
```

## Store API (RefsMap)

```tsx
interface RefsMap<T extends HTMLElement> {
  register(key: string, element: T | null): void;   // Register element
  unregister(key: string): void;                     // Unregister element
  get(key: string): T | null;                        // Get element
  getAll(): Map<string, T>;                          // Get all elements
  has(key: string): boolean;                         // Check if element exists
  clear(): void;                                     // Remove all elements
}
```

## Pattern Selection Guide

- **When Context is needed**: Use `createRefsStore()`
- **For local usage without Context**: Use `useRefsStore()`
- **Use only inside Provider**: `useStore()`
- **Use both inside and outside Provider**: `useStore({ optional: true })`

## 📄 License

MIT

## 🤝 Contributing

Contributions are always welcome! Please read the contribution guidelines first.

## 🐛 Issues

If you find a bug, please create an issue [here](https://github.com/znehraks/react-ref-store/issues).