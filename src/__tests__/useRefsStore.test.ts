import { renderHook, act } from '@testing-library/react';
import { useRefsStore } from '../useRefsStore';

describe('useRefsStore', () => {
  it('should initialize with empty map', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    
    expect(result.current.getAll().size).toBe(0);
    expect(result.current.has('test')).toBe(false);
  });

  it('should register and retrieve elements', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    const element = document.createElement('div');
    
    act(() => {
      result.current.register('test-key', element);
    });
    
    expect(result.current.get('test-key')).toBe(element);
    expect(result.current.has('test-key')).toBe(true);
  });

  it('should unregister elements', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    const element = document.createElement('div');
    
    act(() => {
      result.current.register('test-key', element);
    });
    
    expect(result.current.has('test-key')).toBe(true);
    
    act(() => {
      result.current.unregister('test-key');
    });
    
    expect(result.current.has('test-key')).toBe(false);
    expect(result.current.get('test-key')).toBeNull();
  });

  it('should handle null elements in register', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    const element = document.createElement('div');
    
    act(() => {
      result.current.register('test-key', element);
    });
    
    expect(result.current.has('test-key')).toBe(true);
    
    act(() => {
      result.current.register('test-key', null);
    });
    
    expect(result.current.has('test-key')).toBe(false);
  });

  it('should get all registered elements', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    
    act(() => {
      result.current.register('key1', element1);
      result.current.register('key2', element2);
    });
    
    const allElements = result.current.getAll();
    expect(allElements.size).toBe(2);
    expect(allElements.get('key1')).toBe(element1);
    expect(allElements.get('key2')).toBe(element2);
  });

  it('should clear all elements', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    
    act(() => {
      result.current.register('key1', element1);
      result.current.register('key2', element2);
    });
    
    expect(result.current.getAll().size).toBe(2);
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.getAll().size).toBe(0);
    expect(result.current.has('key1')).toBe(false);
    expect(result.current.has('key2')).toBe(false);
  });

  it('should return null for non-existent keys', () => {
    const { result } = renderHook(() => useRefsStore<HTMLDivElement>());
    
    expect(result.current.get('non-existent')).toBeNull();
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useRefsStore<HTMLDivElement>());
    
    const firstRender = {
      register: result.current.register,
      unregister: result.current.unregister,
      get: result.current.get,
      getAll: result.current.getAll,
      has: result.current.has,
      clear: result.current.clear,
    };
    
    rerender();
    
    expect(result.current.register).toBe(firstRender.register);
    expect(result.current.unregister).toBe(firstRender.unregister);
    expect(result.current.get).toBe(firstRender.get);
    expect(result.current.getAll).toBe(firstRender.getAll);
    expect(result.current.has).toBe(firstRender.has);
    expect(result.current.clear).toBe(firstRender.clear);
  });
}); 