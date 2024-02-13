import { writable, get, type Subscriber, type Unsubscriber, type Updater, type Writable, type StartStopNotifier } from 'svelte/store';
import { browser } from '$app/environment';

type TransitioningTypes = ((res: void) => void) | null;
export const transitioning = writable<TransitioningTypes>(null);

type OnKeydownType = ((event: KeyboardEvent) => void);
export const onKeydown = writable<OnKeydownType>(() => {});

export type StoreContract<T> = {
    subscribe(this: void, run: Subscriber<T>): Unsubscriber;
    set(this: void, value: T): void;
    update(this: void, updater: Updater<T>): void;

    init: StartStopNotifier<T>;
}

export function proxyStore<T>(initialValue: T, init: (source: Writable<T>) => StoreContract<T>) {
    const source = writable<T>(initialValue, (set, update) => {
        return methods.init(set, update);
    });
    const methods = init(source);

    return {
        ...source,
        ...methods
    };
}

export const localStorageBacked = function<T>(key: string, initial: T) {
    return proxyStore(initial, source => {
        return {
            set(newValue) {
                if (browser) { localStorage.setItem(key, JSON.stringify(newValue)); }
                return source.set(newValue);
            },
            update(updater) {
                if (browser) { localStorage.setItem(key, JSON.stringify(source)); }
                return source.update(updater);
            },
            subscribe: (callback) => source.subscribe(callback),
            init: (set) => {
                if (!browser) return;

                const stored = localStorage.getItem(key);

                if (stored === null) {
                    set(initial);
                } else {
                    set(JSON.parse(stored));
                }
            }
        };
    });
};

export const centralizedKey = 'persistibles';
export type JSONValue = null | boolean | number | string | JSONValue[] | { [k: string]: JSONValue };
export const localStorageCentralized = function<T extends JSONValue>(localKey: string, initial: T): StoreContract<T> {
    let data: Record<string, T> = {};

    data[localKey] = initial;
    if (browser) {
        const stored = localStorage.getItem(centralizedKey);

        if (stored !== null) {
            data = Object.assign(data, JSON.parse(stored))
        }
    }

    return proxyStore(initial, source => {
        return {
            set(newValue) {
                data[localKey] = newValue;
                if (browser) { localStorage.setItem(centralizedKey, JSON.stringify(data)); }
                return source.set(newValue);
            },
            update(updater) {
                data[localKey] = updater(get(source));
                if (browser) { localStorage.setItem(centralizedKey, JSON.stringify(data)); }
                return source.update(updater);
            },
            subscribe: (callback) => source.subscribe(callback),
            init: (set) => {
                set(data[localKey]);
            }
        };
    });
};