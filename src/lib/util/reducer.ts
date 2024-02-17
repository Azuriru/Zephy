import { browser } from '$app/environment';
import { centralizedKey } from './store';
import assert from 'assertmin';

interface HistoryStack<State, Event> {
    state: State;
    events: Event[];
    index: number;

    do(event: Event): void;
    undoEvent(): Event | null;
    redoEvent(): Event | null;
    undo(): boolean;
    redo(): boolean;
}

type Event = (state: State) => State;

export type Item = {
    value: string;
    id: number;
    checked: boolean;
    timestamp: number | null;
};

export type Group = {
    id: number;
    name: string;
    items: Item[];
};

export type State = {
    groups: Group[];
};

export class TodosHistory implements HistoryStack<State | null, Event> {
    setter: (hist: TodosHistory) => void;
    state: State = { groups: [] };
    events: Event[] = [];
    index: number = 0;
    initial: State;

    constructor(setter: (hist: TodosHistory) => void, state: State) {
        this.setter = setter;
        this.initial = state;
        this.init(state);
    }

    init(state: State) {
        let data: Record<string, State> = {};

        data['list'] = state;
        if (browser) {
            const stored = localStorage.getItem(centralizedKey);

            if (stored !== null) {
                data = Object.assign(data, JSON.parse(stored))
            }
        }
        this.state = data['list'];
    }

    updateLocalStorage() {
        let data: Record<string, State> = {};

        if (browser) {
            const stored = localStorage.getItem(centralizedKey);

            if (stored !== null) {
                data = Object.assign(data, JSON.parse(stored))
            }

            data['list'] = this.state;
            localStorage.setItem(centralizedKey, JSON.stringify(data));
        }
    }

    do(event: Event) {
        this.events.length = this.index;
        this.events.push(event);

        this.state = this.events.reduce((state, callback) => callback(state), this.initial);

        assert(this.redo());
    }

    undoEvent(): Event | null {
        if (this.index !== 0) {
            this.index--;
            return this.events[this.index];
        }

        return null;
    }

    redoEvent(): Event | null {
        if (this.index < this.events.length) {
            this.index++;
            return this.events[this.index - 1];
        }

        return null;
    }

    undo(): boolean {
        const event = this.undoEvent();
        if (event === null) return false;

        this.setter(this);
        this.updateLocalStorage();

        return true;
    }

    redo(): boolean {
        const event = this.redoEvent();
        if (event === null) return false;

        this.setter(this);
        this.updateLocalStorage();

        return true;
    }
}