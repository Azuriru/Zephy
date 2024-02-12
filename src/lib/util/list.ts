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
    index: number;
    item: Item;
};

type CheckEvent = {
    type: 'check';
    itemIndex: number;
    groupIndex: number;
    previous: Item;
};

type UncheckEvent = {
    type: 'uncheck';
    index: number;
    item: Item;
};

type AddGroupEvent = {
    type: 'addGroup';
    index: number;
    group: Group;
}

type RemoveEvent = {
    type: 'remove';
    itemIndex: number;
    groupIndex: number;
    removed: Item;
};

type EditTodo = {
    type: 'edit';
    itemIndex: number;
    groupIndex: number;
    previous: Item;
    edited: Item;
};

type Event = AddEvent | CheckEvent | UncheckEvent | AddGroupEvent | RemoveEvent | EditTodo;

export type Item = {
    value: string;
    id: number;
    groupIndex: number;
    checked?: boolean;
    timestamp?: number;
};

type Group = {
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
        this.state = state;
    }

    do(event: Event) {
        this.events.length = this.index;

        switch (event.type) {
            case 'edit': {
                const lastEvent = this.events[this.index - 1];

                if (lastEvent.type === 'edit' && lastEvent.itemIndex === event.itemIndex) {
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
                this.state.groups[event.item.groupIndex].items.splice(event.index, 1);
                break;
            case 'remove':
                this.state.groups[event.groupIndex].items.splice(event.itemIndex, 0, event.removed);
                break;
            case 'edit':
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.previous;
                break;
            default:
                console.log(event);
                // assert.unreachable(event);
        }

        this.setter(this);

        return true;
    }

    redo(): boolean {
        const event = this.redoEvent();
        if (event === null) return false;

        switch (event.type) {
            case 'add':
                this.state.groups[event.item.groupIndex].items.push(event.item);
                break;
            case 'addGroup':
                this.state.groups.push(event.group);
                break;
            case 'remove':
                this.state.groups[event.groupIndex].items.splice(event.itemIndex, 1);
                break;
            case 'edit':
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.edited;
                break;
            default:
                console.log(event);
                // assert.unreachable(event);
        }

        this.setter(this);

        return true;
    }
}