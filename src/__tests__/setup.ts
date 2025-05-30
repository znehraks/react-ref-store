/// <reference types="@types/node" />
import '@testing-library/jest-dom';

declare global {
  function requestAnimationFrame(callback: FrameRequestCallback): number;
  function cancelAnimationFrame(id: number): void;
}

// Mock requestAnimationFrame for tests
globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(0), 0) as unknown as number;
};

globalThis.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
}; 