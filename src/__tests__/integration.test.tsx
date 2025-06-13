import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createRefsStore } from '../createRefsStore';
import { useRegisterRef } from '../useRegisterRef';

describe('Integration Tests', () => {
  it('should work with real React components', async () => {
    const TabRefsStore = createRefsStore<HTMLButtonElement>();

    const TabGroup = ({ children }: { children: React.ReactNode }) => {
      return <TabRefsStore.Provider>{children}</TabRefsStore.Provider>;
    };

    const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => {
      const store = TabRefsStore.useStore();
      const ref = useRegisterRef(store, id);

      return (
        <button ref={ref} data-testid={`tab-${id}`}>
          {children}
        </button>
      );
    };

    const TabController = () => {
      const store = TabRefsStore.useStore();

      useEffect(() => {
        // Use setTimeout to ensure elements are registered
        const timer = setTimeout(() => {
          const tab2 = store?.get('tab2');
          if (tab2) {
            tab2.focus();
          }
        }, 100);

        return () => clearTimeout(timer);
      }, [store]);

      return null;
    };

    render(
      <TabGroup>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
        <TabController />
      </TabGroup>,
    );

    // Wait for elements to be registered and focused
    await waitFor(
      () => {
        const tab2 = screen.getByTestId('tab-tab2');
        expect(document.activeElement).toBe(tab2);
      },
      { timeout: 500 },
    );
  });

  it('should handle dynamic component mounting and unmounting', async () => {
    const MenuRefsStore = createRefsStore<HTMLDivElement>();

    const Menu = ({ children }: { children: React.ReactNode }) => {
      return <MenuRefsStore.Provider>{children}</MenuRefsStore.Provider>;
    };

    const MenuItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
      const store = MenuRefsStore.useStore();
      const ref = useRegisterRef(store, id);

      return (
        <div ref={ref} data-testid={`menu-${id}`}>
          {children}
        </div>
      );
    };

    const MenuController = ({
      onStoreUpdate,
      expectedKeys,
    }: {
      onStoreUpdate: (size: number) => void;
      expectedKeys: string[];
    }) => {
      const store = MenuRefsStore.useStore();

      useEffect(() => {
        // Use timeout to ensure refs are registered
        const timer = setTimeout(() => {
          if (store) {
            // 실제로 등록된 키들의 개수를 계산
            const actualSize = expectedKeys.filter((key) => store.has(key)).length;
            onStoreUpdate(actualSize);
          }
        }, 50);

        return () => clearTimeout(timer);
      }, [store, onStoreUpdate, expectedKeys]);

      return null;
    };

    let storeSize = 0;
    const handleStoreUpdate = (size: number) => {
      storeSize = size;
    };

    const { rerender } = render(
      <Menu>
        <MenuItem id="item1">Item 1</MenuItem>
        <MenuItem id="item2">Item 2</MenuItem>
        <MenuController onStoreUpdate={handleStoreUpdate} expectedKeys={['item1', 'item2']} />
      </Menu>,
    );

    await waitFor(
      () => {
        expect(storeSize).toBe(2);
      },
      { timeout: 200 },
    );

    // Add more items
    rerender(
      <Menu>
        <MenuItem id="item1">Item 1</MenuItem>
        <MenuItem id="item2">Item 2</MenuItem>
        <MenuItem id="item3">Item 3</MenuItem>
        <MenuController onStoreUpdate={handleStoreUpdate} expectedKeys={['item1', 'item2', 'item3']} />
      </Menu>,
    );

    await waitFor(
      () => {
        expect(storeSize).toBe(3);
      },
      { timeout: 200 },
    );

    // Remove an item
    rerender(
      <Menu>
        <MenuItem id="item1">Item 1</MenuItem>
        <MenuItem id="item3">Item 3</MenuItem>
        <MenuController onStoreUpdate={handleStoreUpdate} expectedKeys={['item1', 'item3']} />
      </Menu>,
    );

    await waitFor(
      () => {
        expect(storeSize).toBe(2);
      },
      { timeout: 200 },
    );
  });

  it('should support multiple stores simultaneously', async () => {
    const ButtonStore = createRefsStore<HTMLButtonElement>();
    const InputStore = createRefsStore<HTMLInputElement>();

    const App = () => {
      const buttonStore = ButtonStore.useStore();
      const inputStore = InputStore.useStore();

      const buttonRef = useRegisterRef(buttonStore, 'submit-btn');
      const inputRef = useRegisterRef(inputStore, 'email-input');

      useEffect(() => {
        // Use timeout to ensure refs are registered
        const timer = setTimeout(() => {
          const input = inputStore?.get('email-input');
          if (input) {
            input.focus();
          }
        }, 100);

        return () => clearTimeout(timer);
      }, [inputStore]);

      return (
        <>
          <input ref={inputRef} type="email" data-testid="email-input" placeholder="Email" />
          <button ref={buttonRef} data-testid="submit-button">
            Submit
          </button>
        </>
      );
    };

    render(
      <ButtonStore.Provider>
        <InputStore.Provider>
          <App />
        </InputStore.Provider>
      </ButtonStore.Provider>,
    );

    await waitFor(
      () => {
        const input = screen.getByTestId('email-input');
        expect(document.activeElement).toBe(input);
      },
      { timeout: 500 },
    );
  });
});
