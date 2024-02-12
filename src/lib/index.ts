import assert from 'assertmin';
import { readable } from 'svelte/store';

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

type InitEvent = {
    type: 'init';
    todos: Todo[];
};

type AddEvent = {
    type: 'add';
    index: number;
    todo: Todo;
};

type RemoveEvent = {
    type: 'remove';
    index: number;
    removed: Todo;
};

type EditTodo = {
    type: 'edit';
    index: number;
    previous: Todo;
    edited: Todo;
};

type Event = InitEvent | AddEvent | RemoveEvent | EditTodo;

export type Todo = {
    text: string;
    id: number;
};
type State = {
    todos: Todo[];
};

class TodosHistory implements HistoryStack<State | null, Event> {
    setter: (hist: TodosHistory) => void;
    state: State = { todos: [] };
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

                if (lastEvent.type === 'edit' && lastEvent.index === event.index) {
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
            case 'init':
                this.state.todos = event.todos;
                break;
            case 'add':
                this.state.todos.splice(event.index, 1);
                break;
            case 'remove':
                this.state.todos.splice(event.index, 0, event.removed);
                break;
            case 'edit':
                this.state.todos[event.index] = event.previous;
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
            case 'init':
                this.state.todos = event.todos;
                break;
            case 'add':
                this.state.todos.push(event.todo);
                break;
            case 'remove':
                this.state.todos.splice(event.index, 1);
                break;
            case 'edit':
                this.state.todos[event.index] = event.edited;
                break;
            default:
                assert.unreachable(event);
        }

        this.setter(this);

        return true;
    }
}

export const todosHistory = readable<TodosHistory>(null as never, (set) => {
    const hist = new TodosHistory(set, {
        todos: []
    });

    set(hist);
});