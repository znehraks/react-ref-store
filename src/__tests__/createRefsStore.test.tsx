import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { createRefsStore } from '../createRefsStore';
import { useRefsStore } from '../useRefsStore';

describe('createRefsStore', () => {
  it('should create a store with Provider and useStore', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    
    expect(TestStore).toHaveProperty('Provider');
    expect(TestStore).toHaveProperty('useStore');
  });

  it('should provide store to children components', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider>{children}</TestStore.Provider>
    );
    
    const { result } = renderHook(() => TestStore.useStore(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('unregister');
    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('getAll');
    expect(result.current).toHaveProperty('has');
    expect(result.current).toHaveProperty('clear');
  });

  it('should throw error when useStore is called outside Provider', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    
    const { result } = renderHook(() => {
      try {
        return TestStore.useStore();
      } catch (error) {
        return error;
      }
    });
    
    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toContain('useStore must be used within a RefsStore.Provider');
  });

  it('should return null when useStore is called with optional flag outside Provider', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    
    const { result } = renderHook(() => TestStore.useStore({ optional: true }));
    
    expect(result.current).toBeNull();
  });

  it('should use external store when provided', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    const { result: externalStoreResult } = renderHook(() => useRefsStore<HTMLButtonElement>());
    const externalStore = externalStoreResult.current;
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider refsStore={externalStore}>{children}</TestStore.Provider>
    );
    
    const { result } = renderHook(() => TestStore.useStore(), { wrapper });
    
    expect(result.current).toBe(externalStore);
  });

  it('should create internal store when external store is not provided', () => {
    const TestStore = createRefsStore<HTMLDivElement>();
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider>{children}</TestStore.Provider>
    );
    
    const { result } = renderHook(() => TestStore.useStore(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current?.getAll().size).toBe(0);
  });

  it('should support nested providers with different stores', () => {
    const OuterStore = createRefsStore<HTMLDivElement>();
    const InnerStore = createRefsStore<HTMLButtonElement>();
    
    let outerStoreRef: any;
    let innerStoreRef: any;
    
    const TestComponent = () => {
      const outerStore = OuterStore.useStore();
      outerStoreRef = outerStore;
      
      return (
        <InnerStore.Provider>
          <InnerComponent />
        </InnerStore.Provider>
      );
    };
    
    const InnerComponent = () => {
      const innerStore = InnerStore.useStore();
      innerStoreRef = innerStore;
      return null;
    };
    
    render(
      <OuterStore.Provider>
        <TestComponent />
      </OuterStore.Provider>
    );
    
    expect(outerStoreRef).toBeDefined();
    expect(innerStoreRef).toBeDefined();
    expect(outerStoreRef).not.toBe(innerStoreRef);
  });

  it('should maintain same store instance across re-renders', () => {
    const TestStore = createRefsStore<HTMLButtonElement>();
    let firstStore: any = null;
    let secondStore: any = null;
    
    const TestComponent = ({ captureStore }: { captureStore: (store: any) => void }) => {
      const store = TestStore.useStore();
      captureStore(store);
      return null;
    };
    
    const { rerender } = render(
      <TestStore.Provider>
        <TestComponent captureStore={(store) => { firstStore = store; }} />
      </TestStore.Provider>
    );
    
    // Add something to the store to test persistence
    act(() => {
      if (firstStore) {
        const element = document.createElement('button');
        firstStore.register('test-key', element);
      }
    });
    
    rerender(
      <TestStore.Provider>
        <TestComponent captureStore={(store) => { secondStore = store; }} />
      </TestStore.Provider>
    );
    
    expect(firstStore).not.toBeNull();
    expect(secondStore).not.toBeNull();
    
    // Check if the stores share the same data (indicating they are the same instance)
    expect(firstStore.has('test-key')).toBe(true);
    expect(secondStore.has('test-key')).toBe(true);
    expect(firstStore.get('test-key')).toBe(secondStore.get('test-key'));
    
    // Check if methods are the same references
    expect(firstStore.register).toBe(secondStore.register);
    expect(firstStore.get).toBe(secondStore.get);
  });
}); 