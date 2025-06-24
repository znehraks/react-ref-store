import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { createRefsStore } from '../createRefsStore';
import { useRefsStore } from '../useRefsStore';

// 테스트용 타입 정의
type TestRefs = {
  'tab-button': HTMLButtonElement;
  'tab-panel': HTMLDivElement;
};

describe('createRefsStore', () => {
  it('should create a store with Provider and useStore', () => {
    const TestStore = createRefsStore<TestRefs>();

    expect(TestStore).toHaveProperty('Provider');
    expect(TestStore).toHaveProperty('useStore');
  });

  it('should provide store to children components', () => {
    const TestStore = createRefsStore<TestRefs>();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider>{children}</TestStore.Provider>
    );

    const { result } = renderHook(() => TestStore.useStore(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('unregister');
    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('has');
    expect(result.current).toHaveProperty('clear');
  });

  it('should throw error when useStore is called outside Provider', () => {
    const TestStore = createRefsStore<TestRefs>();

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

  it('should use external store when provided', () => {
    const TestStore = createRefsStore<TestRefs>();
    const { result: externalStoreResult } = renderHook(() => useRefsStore<TestRefs>());
    const externalStore = externalStoreResult.current;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider refsStore={externalStore}>{children}</TestStore.Provider>
    );

    const { result } = renderHook(() => TestStore.useStore(), { wrapper });

    expect(result.current).toBe(externalStore);
  });

  it('should create internal store when external store is not provided', () => {
    const TestStore = createRefsStore<TestRefs>();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestStore.Provider>{children}</TestStore.Provider>
    );

    const { result } = renderHook(() => TestStore.useStore(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current?.has('tab-button')).toBe(false);
  });

  it('should support nested providers with different stores', () => {
    const OuterStore = createRefsStore<{ 'outer-div': HTMLDivElement }>();
    const InnerStore = createRefsStore<{ 'inner-button': HTMLButtonElement }>();

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
      </OuterStore.Provider>,
    );

    expect(outerStoreRef).toBeDefined();
    expect(innerStoreRef).toBeDefined();
    expect(outerStoreRef).not.toBe(innerStoreRef);
  });

  it('should maintain same store instance across re-renders', () => {
    const TestStore = createRefsStore<{ 'test-button': HTMLButtonElement }>();
    let firstStore: any = null;
    let secondStore: any = null;

    const TestComponent = ({ captureStore }: { captureStore: (store: any) => void }) => {
      const store = TestStore.useStore();
      captureStore(store);
      return null;
    };

    const { rerender } = render(
      <TestStore.Provider>
        <TestComponent
          captureStore={(store) => {
            firstStore = store;
          }}
        />
      </TestStore.Provider>,
    );

    // Add something to the store to test persistence
    act(() => {
      if (firstStore) {
        const element = document.createElement('button');
        firstStore.register('test-button', element);
      }
    });

    rerender(
      <TestStore.Provider>
        <TestComponent
          captureStore={(store) => {
            secondStore = store;
          }}
        />
      </TestStore.Provider>,
    );

    expect(firstStore).not.toBeNull();
    expect(secondStore).not.toBeNull();

    // Check if the stores share the same data (indicating they are the same instance)
    expect(firstStore.has('test-button')).toBe(true);
    expect(secondStore.has('test-button')).toBe(true);
    expect(firstStore.get('test-button')).toBe(secondStore.get('test-button'));

    // Check if methods are the same references
    expect(firstStore.register).toBe(secondStore.register);
    expect(firstStore.get).toBe(secondStore.get);
  });
});
