import { createStore } from '.';

describe('app/features/wording-studio/store', () => {
  it('should create a store', () => {
    const store = createStore({
      hello: 'world',
    });
    expect(store).toMatchInlineSnapshot(`
      {
        "data": {
          "hello": "world",
        },
        "getField": [Function],
        "getFieldFromPath": [Function],
        "setField": [Function],
        "setFieldFromPath": [Function],
        "subscribe": [Function],
        "subscribeKey": [Function],
      }
    `);
  });

  describe('set fields', () => {
    it('should set a top-level field', () => {
      const store = createStore({
        hello: 'world',
        count: 0,
      });

      expect(store.data).toEqual({
        hello: 'world',
        count: 0,
      });

      store.setFieldFromPath(['hello'], 'universe');

      expect(store.data).toEqual({
        hello: 'universe',
        count: 0,
      });
    });
    it('should set top-level value using function', () => {
      const store = createStore({
        hello: 'world',
        count: 0,
      });

      expect(store.data).toEqual({
        hello: 'world',
        count: 0,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      store.setFieldFromPath(['hello'], (prev) => prev + ' universe');

      expect(store.data).toEqual({
        hello: 'world universe',
        count: 0,
      });
    });

    it('should set a nested field', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      store.setFieldFromPath(['user', 'address', 'city'], 'Looking Glass');

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            city: 'Looking Glass',
            zip: '12345',
          },
        },
      });
    });
    it('should set nested field using function', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      store.setFieldFromPath(
        ['user', 'address', 'city'],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (prev) => prev + ' City',
      );

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland City',
            zip: '12345',
          },
        },
      });
    });

    it('should updates whole path references ', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      const rootRef = store.data;
      const userRef = store.getFieldFromPath(['user']);
      const addressRef = store.getFieldFromPath(['user', 'address']);

      store.setFieldFromPath(['user', 'address', 'city'], 'Looking Glass');

      expect(store.data).not.toBe(rootRef);
      expect(store.getFieldFromPath(['user'])).not.toBe(userRef);
      expect(store.getFieldFromPath(['user', 'address'])).not.toBe(addressRef);
    });
    it('should keep unchanged references intact', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
            postal: {
              code: 'XYZ',
            },
          },
        },
        settings: {
          theme: 'dark',
        },
      });

      const postalRef = store.getFieldFromPath(['user', 'address', 'postal']);
      const settingsRef = store.getFieldFromPath(['settings']);

      store.setFieldFromPath(['user', 'address', 'city'], 'Looking Glass');

      expect(store.getFieldFromPath(['settings'])).toBe(settingsRef);
      expect(store.getFieldFromPath(['user', 'address', 'postal'])).toBe(
        postalRef,
      );
    });

    it('should remove fields when setting to undefined', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
      });

      store.setFieldFromPath(['user', 'address', 'city'], undefined);

      expect(store.data).toEqual({
        user: {
          name: 'Alice',
          address: {
            zip: '12345',
          },
        },
      });

      store.setFieldFromPath(['user', 'name'], undefined);

      expect(store.data).toEqual({
        user: {
          address: {
            zip: '12345',
          },
        },
      });
    });
  });

  describe('subscriptions', () => {
    it('should subscribe to all changes', () => {
      const store = createStore({
        count: 0,
      });

      const callback = vi.fn();
      const unsubscribe = store.subscribe(callback);

      expect(callback).not.toHaveBeenCalled();

      store.setFieldFromPath(['count'], 1);
      expect(callback).toHaveBeenCalledTimes(1);

      store.setFieldFromPath(['count'], 2);
      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();

      store.setFieldFromPath(['count'], 3);
      expect(callback).toHaveBeenCalledTimes(2);
    });
    it('should subscribe to key changes', () => {
      const store = createStore({
        user: {
          name: 'Alice',
          address: {
            city: 'Wonderland',
            zip: '12345',
          },
        },
        settings: {
          theme: 'dark',
        },
      });

      const userCallback = vi.fn();
      const unsubscribeUser = store.subscribeKey('user', userCallback);

      const cityCallback = vi.fn();
      const unsubscribeCity = store.subscribeKey(
        'user.address.city',
        cityCallback,
      );

      const settingsCallback = vi.fn();
      const unsubscribeSettings = store.subscribeKey(
        'settings',
        settingsCallback,
      );

      expect(userCallback).not.toHaveBeenCalled();
      expect(cityCallback).not.toHaveBeenCalled();
      expect(settingsCallback).not.toHaveBeenCalled();

      // Update user.name -> should trigger userCallback
      store.setFieldFromPath(['user', 'name'], 'Bob');
      expect(userCallback).toHaveBeenCalledTimes(1);
      expect(cityCallback).toHaveBeenCalledTimes(0); // No change
      expect(settingsCallback).toHaveBeenCalledTimes(0); // No change

      // Update user.address.city -> should trigger both userCallback and cityCallback
      store.setFieldFromPath(['user', 'address', 'city'], 'Looking Glass');
      expect(userCallback).toHaveBeenCalledTimes(2);
      expect(cityCallback).toHaveBeenCalledTimes(1);
      expect(settingsCallback).toHaveBeenCalledTimes(0); // No change

      // Update settings.theme -> should trigger settingsCallback only
      store.setFieldFromPath(['settings', 'theme'], 'light');
      expect(userCallback).toHaveBeenCalledTimes(2); // No change
      expect(cityCallback).toHaveBeenCalledTimes(1); // No change
      expect(settingsCallback).toHaveBeenCalledTimes(1);

      // Unsubscribe userCallback
      unsubscribeUser();
      store.setFieldFromPath(['user', 'name'], 'Charlie');
      expect(userCallback).toHaveBeenCalledTimes(2); // No change
      expect(cityCallback).toHaveBeenCalledTimes(1); // No change
      expect(settingsCallback).toHaveBeenCalledTimes(1); // No change

      // Unsubscribe cityCallback
      unsubscribeCity();
      store.setFieldFromPath(['user', 'address', 'city'], 'New City');
      expect(userCallback).toHaveBeenCalledTimes(2); // No change
      expect(cityCallback).toHaveBeenCalledTimes(1); // No change
      expect(settingsCallback).toHaveBeenCalledTimes(1); // No change

      // Unsubscribe settingsCallback
      unsubscribeSettings();
      store.setFieldFromPath(['settings', 'theme'], 'blue');
      expect(userCallback).toHaveBeenCalledTimes(2); // No change
      expect(cityCallback).toHaveBeenCalledTimes(1); // No change
      expect(settingsCallback).toHaveBeenCalledTimes(1); // No change
    });
  });
});
