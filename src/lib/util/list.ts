import { browser } from '$app/environment';
import { clone } from '.';
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

type AddEvent = {
    type: 'add';
    itemIndex: number;
    groupIndex: number;
    item: Item;
};

type RemoveEvent = {
    type: 'remove';
    itemIndex: number;
    groupIndex: number;
    removed: Item;
};

type EditEvent = {
    type: 'edit';
    itemIndex: number;
    groupIndex: number;
    previous: Item;
    edited: Item;
};

type CheckEvent = {
    type: 'check';
    itemIndex: number;
    groupIndex: number;
    previous: Item;
    edited: Item;
};

type UncheckEvent = {
    type: 'uncheck';
    itemIndex: number;
    groupIndex: number;
    previous: Item;
    edited: Item;
};

type AddGroupEvent = {
    type: 'add-group';
    groupIndex: number;
    group: Group;
}

type RemoveGroupEvent = {
    type: 'remove-group';
    groupIndex: number;
    removed: Group;
}

type EditGroupEvent = {
    type: 'edit-group';
    groupIndex: number;
    previous: Group;
    edited: Group;
}

type CheckGroupEvent = {
    type: 'check-group';
    groupIndex: number;
    edited: Group;
    previous: Group;
};

type UncheckGroupEvent = {
    type: 'uncheck-group';
    groupIndex: number;
    edited: Group;
    previous: Group;
};

type RemoveAllEvent = {
    type: 'remove-all',
    removed: Group[]
}

type CheckAllEvent = {
    type: 'check-all';
    previous: Group[];
    edited: Group[];
};

type UncheckAllEvent = {
    type: 'uncheck-all';
    previous: Group[];
    edited: Group[];
};

type ItemEvents = AddEvent | RemoveEvent | EditEvent | CheckEvent | UncheckEvent;
type GroupEvents = AddGroupEvent | RemoveGroupEvent | EditGroupEvent | CheckGroupEvent | UncheckGroupEvent;
type Event = ItemEvents | GroupEvents | RemoveAllEvent | CheckAllEvent | UncheckAllEvent;

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

    constructor(setter: (hist: TodosHistory) => void, state: State) {
        this.setter = setter;
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

        switch (event.type) {
            case 'edit': {
                const lastEvent = this.events[this.index - 1];

                if (lastEvent && lastEvent.type === 'edit' && lastEvent.itemIndex === event.itemIndex) {
                    lastEvent.edited = event.edited;
                    this.index--;
                } else {
                    this.events.push(event);
                }
                break;
            }
            case 'edit-group': {
                const lastEvent = this.events[this.index - 1];

                if (lastEvent && lastEvent.type === 'edit-group' && lastEvent.groupIndex === event.groupIndex) {
                    lastEvent.edited = event.edited;
                    this.index--;
                } else {
                    this.events.push(event);
                }
                break;
            }
            default:
                this.events.push(event);
        }
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

        switch (event.type) {
            case 'add':
                this.state.groups[event.groupIndex].items.splice(event.itemIndex, 1);
                break;
            case 'remove':
                this.state.groups[event.groupIndex].items.splice(event.itemIndex, 0, event.removed);
                break;
            case 'edit':
            case 'check':
            case 'uncheck':
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.previous;
                break;
            case 'add-group':
                this.state.groups.splice(event.groupIndex, 1);
                break;
            case 'remove-group':
                this.state.groups.splice(event.groupIndex, 0, event.removed);
                break;
            case 'edit-group':
            case 'check-group':
            case 'uncheck-group':
                this.state.groups[event.groupIndex] = event.previous;
                break;
            case 'remove-all':
                this.state.groups = event.removed;
                break;
            case 'check-all':
            case 'uncheck-all':
                this.state.groups = event.previous;
                break;
            default:
                assert.unreachable(event);
        }

        this.setter(this);
        this.updateLocalStorage();

        return true;
    }

    redo(): boolean {
        const event = this.redoEvent();
        if (event === null) return false;

        switch (event.type) {
            case 'add':
                this.state.groups[event.groupIndex].items.push(event.item);
                break;
            case 'remove':
                this.state.groups[event.groupIndex].items.splice(event.itemIndex, 1);
                break;
            case 'edit':
            case 'check':
            case 'uncheck':
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.edited;
                break;
            case 'add-group':
                this.state.groups.push(clone(event.group));
                break;
            case 'remove-group':
                this.state.groups.splice(event.groupIndex, 1);
                break;
            case 'edit-group':
            case 'check-group':
            case 'uncheck-group':
                this.state.groups[event.groupIndex] = event.edited;
                break
            case 'remove-all':
                this.state.groups = [];
                break;
            case 'check-all':
            case 'uncheck-all':
                this.state.groups = event.edited;
                break;
            default:
                assert.unreachable(event);
        }

        this.setter(this);
        this.updateLocalStorage();

        return true;
    }
}