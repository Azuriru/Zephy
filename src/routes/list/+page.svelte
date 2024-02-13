<script lang="ts">
    import { TodosHistory } from '$lib/util/list';
    import { FontAwesome } from '$lib/components';
    import { capitalize, clone } from '$lib/util';
    import { readable } from 'svelte/store';
    import sample from '../default.json';

    type InputEvent = Event & { currentTarget: EventTarget & HTMLInputElement; }

    const todosHistory = readable<TodosHistory>(null as never, (set) => {
        const hist = new TodosHistory((set), {
            groups: []
        });

        set(hist);
    });

    function formatTimestamp(timestamp?: number) {
        if (!timestamp) {
            return '';
        }

        const d = new Date(timestamp);
        const h = d.getHours();
        const m = d.getMinutes();
        const s = d.getSeconds();

        const date = d.getDate();
        const month = d.getMonth();
        const year = d.getFullYear();

        const pad = (number: number) => number.toString().padStart(2, '0');

        return `${pad(h)}:${pad(m)}:${pad(s)} ${pad(date)}/${pad(month + 1)}/${year}`;
    }

    function addItem(groupIndex: number) {
        $todosHistory.do({
            type: 'add',
            itemIndex: $todosHistory.state.groups[groupIndex].items.length,
            groupIndex,
            item: {
                value: '',
                id: Math.floor(Math.random() * 1e20)
            }
        });
    }

    function removeItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'remove',
            itemIndex,
            groupIndex,
            removed: $todosHistory.state.groups[groupIndex].items[itemIndex]
        });
    }

    function editItem(e: InputEvent, groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'edit',
            itemIndex,
            groupIndex,
            previous: $todosHistory.state.groups[groupIndex].items[itemIndex],
            edited: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex],
                value: capitalize(e.currentTarget.value)
            }
        });
    }

    function checkItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'check',
            itemIndex,
            groupIndex,
            previous: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex]
            }
        });
    }

    function uncheckItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'uncheck',
            itemIndex,
            groupIndex
        });
    }

    function onCheckItem(groupIndex: number, itemIndex: number) {
        if ($todosHistory.state.groups[groupIndex].items[itemIndex].checked) {
            uncheckItem(groupIndex, itemIndex);
        } else {
            checkItem(groupIndex, itemIndex);
        }
    }

    function addGroup() {
        $todosHistory.do({
            type: 'add-group',
            groupIndex: $todosHistory.state.groups.length,
            group: {
                items: [],
                name: '',
                id: Math.floor(Math.random() * 1e20)
            }
        });
    }

    function removeGroup(groupIndex: number) {
        $todosHistory.do({
            type: 'remove-group',
            groupIndex,
            removed: $todosHistory.state.groups[groupIndex]
        });
    }

    function editGroup(e: InputEvent, groupIndex: number) {
        $todosHistory.do({
            type: 'edit-group',
            groupIndex,
            previous: $todosHistory.state.groups[groupIndex],
            edited: {
                ...$todosHistory.state.groups[groupIndex],
                name: capitalize(e.currentTarget.value)
            }
        });
    }

    function checkGroup(groupIndex: number) {
        $todosHistory.do({
            type: 'check-group',
            groupIndex,
            previous: clone($todosHistory.state.groups[groupIndex])
        });
    }

    function uncheckGroup(groupIndex: number) {
        $todosHistory.do({
            type: 'uncheck-group',
            groupIndex
        });
    }

    function removeAll() {
        $todosHistory.do({
            type: 'remove-all',
            removed: $todosHistory.state.groups
        });
    }

    function checkAll() {
        $todosHistory.do({
            type: 'check-all',
            previous: clone($todosHistory.state.groups)
        });
    }

    function uncheckAll() {
        $todosHistory.do({
            type: 'uncheck-all'
        });
    }
</script>

<div class="list">
    {#if !$todosHistory.state.groups.length}
        <div class="list-empty">
            There's nothing here, consider adding something?
        </div>
    {/if}
    {#each $todosHistory.state.groups as group, groupIndex (group.id)}
        {@const { name: value, items } = group}
        <div class="list-group">
            <div class="list-header">
                <input
                    class="list-group-input"
                    type="text"
                    placeholder="New group"
                    {value}
                    on:input={(e) => editGroup(e, groupIndex)}
                />
                <div class="list-group-actions">
                    <button type="button" on:click={() => removeGroup(groupIndex)}>
                        <FontAwesome name="trash-can" type="regular" />
                    </button>
                    <button type="button" on:click={() => uncheckGroup(groupIndex)}>
                        <FontAwesome name="square" type="regular" />
                    </button>
                    <button type="button" on:click={() => checkGroup(groupIndex)}>
                        <FontAwesome name="square-check" type="regular" />
                    </button>
                </div>
            </div>
            {#each items as item, itemIndex (item.id)}
                {@const { value, checked, timestamp } = item}
                <div class="list-item" class:checked>
                    <div class="list-drag">
                        <FontAwesome name="grip-vertical" />
                    </div>
                    <label class="list-label">
                        <input
                            type="checkbox"
                            {checked}
                            on:change={() => onCheckItem(groupIndex, itemIndex)}
                        />
                        <div class="list-checkbox">
                            {#if checked}
                                <FontAwesome name="check" />
                            {/if}
                        </div>
                        <div class="list-item-info">
                            <input
                                class="list-item-name"
                                type="text"
                                placeholder="New item"
                                {value}
                                on:input={(e) => editItem(e, groupIndex, itemIndex)}
                            />
                            {#if timestamp}
                                <span class="list-item-timestamp">{formatTimestamp(timestamp)}</span>
                            {/if}
                        </div>
                    </label>
                    <button type="button" class="list-item-remove" on:click={() => removeItem(groupIndex, itemIndex)}>
                        <FontAwesome name="xmark" />
                    </button>
                </div>
            {/each}
            <button type="button" class="list-last" on:click={() => addItem(groupIndex)}>
                <div class="list-plus">
                    <FontAwesome name="plus" />
                </div>
                <span class="list-plus-text">Add item</span>
            </button>
        </div>
    {/each}
</div>

<div class="toolbar">
    <div class="toolbar-left">
        <button type="button" on:click={() => addGroup()}>
            <FontAwesome name="square-plus" type="regular" />
        </button>
        <button type="button" class="history-control" on:click={() => $todosHistory.undo()} disabled={$todosHistory.index === 0}>
            <FontAwesome name="arrow-rotate-left" />
        </button>
        <button type="button" class="history-control" on:click={() => $todosHistory.redo()} disabled={$todosHistory.index === $todosHistory.events.length}>
            <FontAwesome name="arrow-rotate-right" />
        </button>
    </div>
    <div class="toolbar-right">
        <button type="button" on:click={removeAll}>
            <FontAwesome name="trash-can" type="regular" />
        </button>
        <button type="button" on:click={uncheckAll}>
            <FontAwesome name="square" type="regular" />
        </button>
        <button type="button" on:click={checkAll}>
            <FontAwesome name="square-check" type="regular" />
        </button>
        <button type="button">
            <FontAwesome name="sliders" />
        </button>
    </div>
</div>

<style lang="scss">
    @use "sass:list";
    @mixin flex($props...) {
        @if list.index($props, hidden) {
            display: none;
        } @else {
            display: flex;
        }

        @each $prop in $props {
            @if $prop == center {
                align-items: center;
                justify-content: center;
            } @else if $prop == startY {
                align-items: flex-start;
            } @else if $prop == centerY {
                align-items: center;
            } @else if $prop == endY {
                align-items: flex-end;
            } @else if $prop == startX {
                justify-content: flex-start;
            } @else if $prop == centerX {
                justify-content: center;
            } @else if $prop == endX {
                justify-content: flex-end;
            } @else if $prop == between {
                justify-content: space-between;
            } @else if $prop == around {
                justify-content: space-around;
            } @else if $prop == evenly {
                justify-content: space-evenly;
            } @else if $prop == column {
                flex-direction: column;
            } @else if $prop == 1 or $prop == one {
                flex: 1 1 0%;
            } @else if $prop == auto {
                flex: 1 1 auto;
            } @else if $prop == initial {
                flex: 0 1 auto;
            } @else if $prop == none {
                flex: none;
            } @else if $prop == noShrink {
                flex-shrink: 0;
            }
        }
    }

    $cube: 36px;
    $checkbox: 24px;
    $hover: #272727;
    $hover-transition: background-color .5s;

    .toolbar {
        @include flex(between);
        background: #20232c;
        padding: 8px;
        position: sticky;
        bottom: 0;
        top: 100%;
        font-size: 24px;

        .toolbar-left,
        .toolbar-right {
            display: flex;

            button:not(:first-of-type) {
                margin-left: 8px;
            }
        }

        .history-control {
            font-size: 20px;

            &:disabled {
                filter: brightness(0.5);
            }
        }
    }

    .list {
        padding: 40px 20px;
        overflow: auto;
        flex-grow: 1;
    }

    .list-empty {
        @include flex(center, one);
        text-align: center;
    }
    .list,
    .list-group,
    .list-item-info {
        @include flex(column);
    }

    .list-group {
        margin-bottom: 20px;
    }

    .list-header {
        @include flex(between);
        padding: 0 8px 0 6px;
        margin-bottom: 10px;

        .list-group-input {
            @include flex;
            width: 100%;
        }

        .list-group-actions {
            @include flex;
            font-size: 18px;

            button {
                @include flex(center);
                width: 20px;
                height: 20px;

                &:not(:first-of-type) {
                    margin-left: 8px;
                }
            }
        }
    }

    .list-item {
        @include flex;
        height: 36px;
        transition: $hover-transition;

        &:hover,
        &:active {
            background: $hover;
        }

        // &:not(:nth-last-of-type(2)) {
            margin-bottom: 4px;
        // }

        &.checked {
            // order: 1;
            filter: brightness(0.5);
        }

        .list-drag {
            @include flex(center, noShrink);
            width: $cube;
            height: $cube;
        }

        .list-label {
            @include flex(centerY, one);
            input {
                appearance: none;

                & + .list-checkbox {
                    @include flex(center, noShrink);
                    width: $checkbox;
                    height: $checkbox;
                    background: rgb(255, 255, 255, 0.1);
                    color: #34d399;
                    margin-right: 8px;
                }
            }

            .list-item-info {
                flex-grow: 1;

                .list-item-name {
                    width: 100%;
                }

                .list-item-timestamp {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    color: #848484;
                }
            }
        }

        .list-item-remove {
            @include flex(center, noShrink);
            width: $cube;
            height: $cube;
        }
    }

    .list-last {
        @include flex(centerY);
        height: $cube;
        padding-left: $cube;
        order: 10;
        transition: $hover-transition;

        &:hover,
        &:active {
            background: $hover;
        }

        .list-plus {
            @include flex(center, noShrink);
            width: $checkbox;
            height: $checkbox;
            margin-right: 8px;
        }

        .list-plus-text {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
</style>