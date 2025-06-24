import { renderHook, act } from '@testing-library/react';
import { useRefsStore } from '../useRefsStore';

// 테스트용 타입 정의
type TestRefs = {
  'test-key': HTMLDivElement;
  'key1': HTMLDivElement;
  'key2': HTMLDivElement;
  'non-existent': HTMLDivElement;
};

describe('useRefsStore', () => {
  it('should initialize with empty map', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    
    expect(result.current.has('test-key')).toBe(false);
    expect(result.current.get('test-key')).toBeUndefined();
  });

  it('should register and retrieve elements', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    const element = document.createElement('div');

    act(() => {
      result.current.register('test-key', element);
    });

    expect(result.current.get('test-key')).toBe(element);
    expect(result.current.has('test-key')).toBe(true);
  });

  it('should unregister elements', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    const element = document.createElement('div');

    act(() => {
      result.current.register('test-key', element);
    });

    expect(result.current.has('test-key')).toBe(true);

    act(() => {
      result.current.unregister('test-key');
    });

    expect(result.current.has('test-key')).toBe(false);
    expect(result.current.get('test-key')).toBeUndefined();
  });

  it('should handle null elements in register', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    const element = document.createElement('div');

    act(() => {
      result.current.register('test-key', element);
    });

    expect(result.current.has('test-key')).toBe(true);

    act(() => {
      result.current.register('test-key', undefined);
    });

    expect(result.current.has('test-key')).toBe(false);
  });

  it('should clear all elements', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const registeredKeys = ['key1', 'key2'];

    act(() => {
      result.current.register('key1', element1);
      result.current.register('key2', element2);
    });
    
    expect(result.current.has('key1')).toBe(true);
    expect(result.current.has('key2')).toBe(true);
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.has('key1')).toBe(false);
    expect(result.current.has('key2')).toBe(false);
    expect(result.current.get('key1')).toBeUndefined();
    expect(result.current.get('key2')).toBeUndefined();
  });

  it('should return undefined for non-existent keys', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    
    expect(result.current.get('non-existent')).toBeUndefined();
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useRefsStore<TestRefs>());
    
    const firstRender = {
      register: result.current.register,
      unregister: result.current.unregister,
      get: result.current.get,
      has: result.current.has,
      clear: result.current.clear,
    };

    rerender();

    expect(result.current.register).toBe(firstRender.register);
    expect(result.current.unregister).toBe(firstRender.unregister);
    expect(result.current.get).toBe(firstRender.get);
    expect(result.current.has).toBe(firstRender.has);
    expect(result.current.clear).toBe(firstRender.clear);
  });

  it('should support type-safe key access', () => {
    const { result } = renderHook(() => useRefsStore<TestRefs>());
    const element = document.createElement('div');
    
    act(() => {
      result.current.register('test-key', element);
    });
    
    // TypeScript should infer the correct return type
    const retrievedElement = result.current.get('test-key');
    expect(retrievedElement).toBe(element);
    
    // Should be undefined for non-existent key
    const nonExistentElement = result.current.get('non-existent');
    expect(nonExistentElement).toBeUndefined();
  });
}); 
