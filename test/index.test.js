/* @flow */

import Gun from 'gun/gun';

// Under test.
import { CompleteToken } from '../src';

describe('gun-most', () => {
  it('CompleteToken', () => {
    const gun = Gun();
    const foo = gun.get('foo');
    const completeToken = CompleteToken();
    setTimeout(() => completeToken.complete(), 10);
    // The "observe" promise should be resolved when it completes.
    return foo.most({ completeToken })
      .observe(() => undefined);
  });

  describe('primitive', () => {
    it('most', () => {
      const gun = Gun();
      const bar = gun.get('foo').path('bar');
      const expected = 'CHANGED';

      // "put" data after a period.
      setTimeout(() => bar.put(expected), 25);

      // Async assertion.
      return new Promise((resolve, reject) => {
        bar.most().observe((data) => {
          try {
            expect(data).toEqual(expected);
          } catch (err) {
            reject(err);
          }
          resolve();
        });
      });
    });

    it('most({ options: { change: true } })', () => {
      const gun = Gun();
      const foo = gun.get('foo').put({
        bar: 'bar',
        baz: 'baz',
        bob: 'bob',
      });

      // "put" data after a period.
      setTimeout(() => foo.path('bob').put('CHANGED'), 25);

      // Async assertion.
      return new Promise((resolve, reject) => {
        let idx = 0;

        foo.most({ options: { change: true } }).observe((data) => {
          if (idx === 1) {
            // We only want to assert on the second "put" operation.
            try {
              const actual = Object.keys(data);
              expect(actual.length).toEqual(2);
              expect(actual).toContainEqual('_');
              expect(actual).toContainEqual('bob');
            } catch (err) {
              reject(err);
            }
            resolve();
          }
          idx += 1;
        });
      });
    });
  });

  describe('set', () => {
    it('most()', () => {
      const gun = Gun();
      const foo = gun.get('foo');
      const expected = [
        { bar: 'baz' },
        { qux: 'quxx' },
      ];

      // "set" data after a period.
      setTimeout(() => expected.forEach(x => foo.set(x)), 25);

      // Async assertion.
      return new Promise((resolve, reject) => {
        const actual = [];
        foo.map().most().observe((data) => {
          actual.push(data);
          if (actual.length === expected.length) {
            try {
              expected.forEach((e, idx) =>
                expect(actual[idx]).toMatchObject(e),
              );
            } catch (err) {
              reject(err);
            }
            resolve();
          }
        });
      });
    });

    it('most({ options: { change: true } })', () => {
      const gun = Gun();
      const foo = gun.get('foo');
      const item = foo.set({
        bar: 'bar',
        baz: 'baz',
        bob: 'bob',
      });

      // "set" data after a period.
      setTimeout(() => item.path('bob').put('CHANGED'), 25);

      // Async assertion.
      return new Promise((resolve, reject) => {
        let idx = 0;

        foo.map().most({ options: { change: true } }).observe((data) => {
          if (idx === 1) {
            // We only want to assert on the second "put" operation.
            try {
              const actual = Object.keys(data);
              expect(actual.length).toEqual(2);
              expect(actual).toContainEqual('_');
              expect(actual).toContainEqual('bob');
            } catch (err) {
              reject(err);
            }
            resolve();
          }
          idx += 1;
        });
      });
    });
  });
});
