import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { useRegisterRef } from '../useRegisterRef';
import { useRefsStore } from '../useRefsStore';

// 테스트용 타입 정의
type TestRefs = {
  'test-key': HTMLDivElement;
  'key1': HTMLDivElement;
  'key2': HTMLDivElement;
};

describe('useRegisterRef', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should register element when mounted', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    // Create a test component that uses the hook
    const TestComponent = () => {
      const ref = useRegisterRef(store, 'test-key');
      return <div ref={ref} data-testid="test-div">Test</div>;
    };
    
    render(<TestComponent />);
    
    // Wait for requestAnimationFrame
    await waitFor(() => {
      expect(store.get('test-key')).toBeTruthy();
    });
  });

  it('should unregister element when unmounted', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = () => {
      const ref = useRegisterRef(store, 'test-key');
      return <div ref={ref}>Test</div>;
    };
    
    const { unmount } = render(<TestComponent />);
    
    await waitFor(() => {
      expect(store.has('test-key')).toBe(true);
    });
    
    unmount();
    
    expect(store.has('test-key')).toBe(false);
  });

  it('should handle null store gracefully', () => {
    const { result } = renderHook(() => useRegisterRef(null, 'test-key'));
    
    expect(result.current.current).toBeNull();
  });

  it('should register immediately when isDefer is false', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = () => {
      const ref = useRegisterRef(store, 'test-key', { isDefer: false });
      return <div ref={ref}>Test</div>;
    };
    
    render(<TestComponent />);
    
    // With isDefer false, still need to wait for useLayoutEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(store.get('test-key')).toBeTruthy();
  });

  it('should not register when isEnabled is false', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = () => {
      const ref = useRegisterRef(store, 'test-key', { isEnabled: false });
      return <div ref={ref}>Test</div>;
    };
    
    render(<TestComponent />);
    
    // Wait to ensure no registration happens
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    expect(store.has('test-key')).toBe(false);
  });

  it('should update registration when key changes', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = ({ id }: { id: keyof TestRefs }) => {
      const ref = useRegisterRef(store, id);
      return <div ref={ref}>Test</div>;
    };
    
    const { rerender } = render(<TestComponent id="key1" />);
    
    await waitFor(() => {
      expect(store.has('key1')).toBe(true);
    });
    
    // Change key
    rerender(<TestComponent id="key2" />);
    
    await waitFor(() => {
      expect(store.has('key1')).toBe(false);
      expect(store.has('key2')).toBe(true);
    });
  });

  it('should handle element change', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = ({ showSecond }: { showSecond: boolean }) => {
      const ref = useRegisterRef(store, 'test-key');
      return showSecond ? 
        <div ref={ref} data-testid="second">Second</div> : 
        <div ref={ref} data-testid="first">First</div>;
    };
    
    const { rerender } = render(<TestComponent showSecond={false} />);
    
    // Wait for first element to be registered
    await waitFor(() => {
      const element = store.get('test-key');
      expect(element).toBeTruthy();
      expect(element?.textContent).toBe('First');
    });
    
    // Change to second element
    rerender(<TestComponent showSecond={true} />);
    
    // Wait for second element to be registered
    await waitFor(() => {
      const element = store.get('test-key');
      expect(element).toBeTruthy();
      expect(element?.textContent).toBe('Second');
    });
  });

  it('should cancel pending RAF on unmount', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const cancelAnimationFrameSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');
    
    const TestComponent = () => {
      const ref = useRegisterRef(store, 'test-key');
      return <div ref={ref}>Test</div>;
    };
    
    const { unmount } = render(<TestComponent />);
    
    // Unmount before RAF completes
    unmount();
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(store.has('test-key')).toBe(false);
    
    cancelAnimationFrameSpy.mockRestore();
  });

  it('should handle options change', async () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = ({ isEnabled }: { isEnabled: boolean }) => {
      const ref = useRegisterRef(store, 'test-key', { isEnabled });
      return <div ref={ref}>Test</div>;
    };
    
    const { rerender } = render(<TestComponent isEnabled={true} />);
    
    await waitFor(() => {
      expect(store.has('test-key')).toBe(true);
    });
    
    // Disable registration
    rerender(<TestComponent isEnabled={false} />);
    
    await waitFor(() => {
      expect(store.has('test-key')).toBe(false);
    });
  });

  it('should support type-safe key access', () => {
    const { result: storeResult } = renderHook(() => useRefsStore<TestRefs>());
    const store = storeResult.current;
    
    const TestComponent = () => {
      // TypeScript should infer the correct ref type based on the key
      const ref = useRegisterRef(store, 'test-key');
      return <div ref={ref}>Test</div>;
    };
    
    render(<TestComponent />);
    
    // The ref should be typed as React.RefObject<HTMLDivElement>
    expect(store).toBeDefined();
  });
}); 