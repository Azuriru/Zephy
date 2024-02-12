<script lang="ts">
    import { todosHistory, type Todo } from '$lib';

    function addTodo() {
        $todosHistory.do({
            type: 'add',
            index: $todosHistory.state.todos.length,
            todo: {
                text: newTodoText,
                id: Math.floor(Math.random() * 1e20)
            }
        });
        newTodoText = '';
    }

    function removeTodo(index: number) {
        $todosHistory.do({
            type: 'remove',
            index,
            removed: $todosHistory.state.todos[index]
        });
    }

    function editTodo(index: number, edited: Todo) {
        $todosHistory.do({
            type: 'edit',
            index,
            previous: $todosHistory.state.todos[index],
            edited
        });
    }

    let newTodoText = 'aaaa';
</script>

<input type="text" bind:value={newTodoText} />
<button type="button" on:click={addTodo}>add</button>

{#each $todosHistory.state.todos as todo, index (todo.id)}
    <div class="history-state">
        <input
            type="text"
            value={todo.text}
            on:input={(e) => editTodo(index, { text: e.currentTarget.value, id: todo.id })}
        />
        <button
            type="button"
            on:click={() => removeTodo(index)}
        >
            delete
        </button>
    </div>
{/each}

<div>
    <button type="button" on:click={() => $todosHistory.undo()} disabled={$todosHistory.index === 0}>undo</button>
    <button type="button" on:click={() => $todosHistory.redo()} disabled={$todosHistory.index === $todosHistory.events.length}>redo</button>
</div>

<pre>
    {JSON.stringify({ state: $todosHistory.state, events: $todosHistory.events, index: $todosHistory.index }, null, 4)}
</pre>

<style lang="scss">
    .history-state {
        display: flex;
    }

    button:disabled {
        filter: brightness(0.5);
    }
</style>