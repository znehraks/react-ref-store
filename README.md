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
- When you need type-safe access to different DOM element types
- Examples: tabs, menus, animation indicators, etc.

## 📖 API

### 1. `createRefsStore<T>()`

A factory function that creates Context, Provider, and Hook all at once with type safety.

```tsx
// Define your refs type
type TabRefs = {
  'tab-button': HTMLButtonElement;
  'tab-panel': HTMLDivElement;
};

const TabRefsStore = createRefsStore<TabRefs>();

// Returns
{
  Provider,  // Context Provider component
  useStore,  // Hook to get the store
}
```

### 2. `useRefsStore<T>()`

Creates a store that manages refs as a Map data structure with type safety. (Can be used standalone without Context)

```tsx
type SearchRefs = {
  'search-field': HTMLDivElement;
  'search-input': HTMLInputElement;
};

function MyComponent() {
  const refsStore = useRefsStore<SearchRefs>();
  // Use Map API: refsStore.get(), refsStore.has(), etc.
}
```

### 3. `useRegisterRef<T, K>()`

A hook that registers a DOM element's ref to the Store with type safety.

```tsx
const ref = useRegisterRef(refsStore, 'unique-key');
return <div ref={ref}>...</div>;
```

## 💡 Usage Examples

### Basic Usage with Type Safety

```tsx
// 1. Define your refs type
type TabRefs = {
  'tab-button': HTMLButtonElement;
  'tab-panel': HTMLDivElement;
};

// 2. Create Store
const TabRefsStore = createRefsStore<TabRefs>();

// 3. Wrap with Provider
export function TabGroup({ children }) {
  return (
    <TabRefsStore.Provider>
      {children}
    </TabRefsStore.Provider>
  );
}

// 4. Register in child components
function Tab({ id, children }) {
  const store = TabRefsStore.useStore();
  const ref = useRegisterRef(store, id); // TypeScript infers correct element type
  
  return <button ref={ref}>{children}</button>;
}

// 5. Use the Store
function TabIndicator({ activeTabId }) {
  const store = TabRefsStore.useStore();
  const activeTab = store.get(activeTabId); // Returns HTMLButtonElement | undefined
  
  if (!activeTab) return null;
  
  const rect = activeTab.getBoundingClientRect();
  // Calculate position and render indicator...
}
```

### External Store Injection

```tsx
// You can inject an external store into the Provider
function CustomTabGroup({ children, externalStore }) {
  return (
    <TabRefsStore.Provider refsStore={externalStore}>
      {children}
    </TabRefsStore.Provider>
  );
}
```

### Direct Store Creation

When using standalone without Context:

```tsx
type FormRefs = {
  'submit-btn': HTMLButtonElement;
  'email-input': HTMLInputElement;
};

function StandaloneComponent() {
  const refsStore = useRefsStore<FormRefs>();
  
  // Use Map API with type safety
  const buttonRef = refsStore.get('submit-btn'); // HTMLButtonElement | undefined
  const hasInput = refsStore.has('email-input'); // boolean
  
  return <ChildComponent refsStore={refsStore} />;
}
```

### Advanced Type Safety

```tsx
// Different element types for different keys
type ComplexRefs = {
  'header': HTMLHeaderElement;
  'nav': HTMLNavElement;
  'main-content': HTMLMainElement;
  'footer': HTMLFooterElement;
  'submit-button': HTMLButtonElement;
  'search-input': HTMLInputElement;
};

const LayoutStore = createRefsStore<ComplexRefs>();

function Header() {
  const store = LayoutStore.useStore();
  const ref = useRegisterRef(store, 'header'); // RefObject<HTMLHeaderElement>
  return <header ref={ref}>Header</header>;
}

function SearchBar() {
  const store = LayoutStore.useStore();
  const ref = useRegisterRef(store, 'search-input'); // RefObject<HTMLInputElement>
  return <input ref={ref} type="search" />;
}
```

## Store API (RefsMap)

```tsx
interface RefsMap<T extends Record<string, HTMLElement>> {
  register<K extends keyof T>(key: K, element: T[K] | undefined): void;   // Register element
  unregister<K extends keyof T>(key: K): void;                             // Unregister element
  get<K extends keyof T>(key: K): T[K] | undefined;                        // Get element
  has<K extends keyof T>(key: K): boolean;                                 // Check if element exists
  clear(): void;                                                           // Remove all elements
}
```

## Provider API

```tsx
interface ProviderProps<T extends Record<string, HTMLElement>> {
  children: ReactNode;
  refsStore?: RefsMap<T>; // Optional external store injection
}
```

## useRegisterRef Options

```tsx
interface UseRegisterRefOptions {
  isDefer?: boolean;   // Defer registration using requestAnimationFrame (default: true)
  isEnabled?: boolean; // Enable/disable registration (default: true)
}
```

## Pattern Selection Guide

- **When Context is needed**: Use `createRefsStore<T>()`
- **For local usage without Context**: Use `useRefsStore<T>()`
- **Use only inside Provider**: `useStore()`
- **Need external store control**: Pass `refsStore` prop to Provider

## Type Safety Benefits

- **Key validation**: TypeScript ensures you only use valid keys
- **Element type inference**: Each key maps to the correct DOM element type
- **Method type safety**: All store methods are properly typed
- **Ref type safety**: `useRegisterRef` returns the correct ref type for each key

## 📄 License

MIT

## 🤝 Contributing

Contributions are always welcome! Please read the contribution guidelines first.

## 🐛 Issues

If you find a bug, please create an issue [here](https://github.com/znehraks/react-ref-store/issues).