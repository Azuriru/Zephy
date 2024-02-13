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
};

type UncheckEvent = {
    type: 'uncheck';
    itemIndex: number;
    groupIndex: number;
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
    previous: Group;
};

type UncheckGroupEvent = {
    type: 'uncheck-group';
    groupIndex: number;
};

type RemoveAllEvent = {
    type: 'remove-all',
    removed: Group[]
}

type CheckAllEvent = {
    type: 'check-all';
    previous: Group[];
};

type UncheckAllEvent = {
    type: 'uncheck-all';
};

type ItemEvents = AddEvent | RemoveEvent | EditEvent | CheckEvent | UncheckEvent;
type GroupEvents = AddGroupEvent | RemoveGroupEvent | EditGroupEvent | CheckGroupEvent | UncheckGroupEvent;
type Event = ItemEvents | GroupEvents | RemoveAllEvent | CheckAllEvent | UncheckAllEvent;

export type Item = {
    value: string;
    id: number;
    checked?: boolean;
    timestamp?: number;
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
            case 'edit-group': {
                const lastEvent = this.events[this.index - 1];

                if (lastEvent.type === 'edit-group' && lastEvent.groupIndex === event.groupIndex) {
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
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.previous;
                break;
            case 'uncheck':
                this.state.groups[event.groupIndex].items[event.itemIndex].checked = true;
                break;
            case 'add-group':
                this.state.groups.splice(event.groupIndex, 1);
                break;
            case 'remove-group':
                this.state.groups.splice(event.groupIndex, 0, event.removed);
                break;
            case 'edit-group':
            case 'check-group':
                this.state.groups[event.groupIndex] = event.previous;
                break;
            case 'uncheck-group':
                for (const item of this.state.groups[event.groupIndex].items) {
                    item.checked = true;
                }
                break;
            case 'remove-all':
                this.state.groups = event.removed;
                break;
            case 'check-all':
                this.state.groups = event.previous;
                break;
            case 'uncheck-all':
                for (const group of this.state.groups) {
                    for (const item of group.items) {
                        item.checked = true;
                    }
                }
                break;
            default:
                assert.unreachable(event);
        }

        this.setter(this);

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
                this.state.groups[event.groupIndex].items[event.itemIndex] = event.edited;
                break;
            case 'check':
                this.state.groups[event.groupIndex].items[event.itemIndex].checked = true;
                this.state.groups[event.groupIndex].items[event.itemIndex].timestamp = Date.now();
                break;
            case 'uncheck':
                this.state.groups[event.groupIndex].items[event.itemIndex].checked = false;
                break;
            case 'add-group':
                this.state.groups.push(event.group);
                break;
            case 'remove-group':
                this.state.groups.splice(event.groupIndex, 1);
                break;
            case 'edit-group':
                this.state.groups[event.groupIndex] = event.edited;
                break;
            case 'check-group':
                for (const item of this.state.groups[event.groupIndex].items) {
                    item.checked = true;
                    item.timestamp = Date.now();
                }
                break;
            case 'uncheck-group':
                for (const item of this.state.groups[event.groupIndex].items) {
                    item.checked = false;
                }
                break;
            case 'remove-all':
                this.state.groups = [];
                break;
            case 'check-all':
                for (const group of this.state.groups) {
                    for (const item of group.items) {
                        item.checked = true;
                        item.timestamp = Date.now();
                    }
                }
                break;
            case 'uncheck-all':
                for (const group of this.state.groups) {
                    for (const item of group.items) {
                        item.checked = false;
                    }
                }
                break;
            default:
                assert.unreachable(event);
        }

        this.setter(this);

        return true;
    }
}