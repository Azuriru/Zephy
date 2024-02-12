<script lang="ts">
    import { localStorageCentralized } from '$lib/util/store';
    import { FontAwesome } from '$lib/components';
    import { capitalize } from '$lib/util';
    import sample from './default.json';

    type Item = {
        value: string;
        checked?: boolean;
        timestamp?: number;
    };

    type Group = {
        name: string;
        items: Item[];
    };

    type List = Group[];
    let list = localStorageCentralized<List>('list', sample);

    type HistoryEntry = {
        type: number;
        groupIndex: number;
        itemIndex: number;
        data?: number;
    }

    const HISTORY_STATE_TYPE = {
        UNCHECK_ITEM: 0,
        CHECK_ITEM: 1,
    } as const;

    let undoHistory: HistoryEntry[] = [];
    let redoHistory: HistoryEntry[] = [];
    let last: Item | null = null;

    function addHistory(type: number, groupIndex: number, itemIndex: number, data?: number) {
        undoHistory.push({
            type,
            groupIndex,
            itemIndex,
            data
        });
        undoHistory = undoHistory;
    }

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
        $list[groupIndex].items.push({ value: '' });
        $list = $list;
        last = $list[groupIndex].items[$list[groupIndex].items.length - 1];
    }

    function removeItem(groupIndex: number, itemIndex: number) {
        $list[groupIndex].items.splice(itemIndex, 1);
        $list = $list;
    }

    function renameItem(groupIndex: number, itemIndex: number) {
        $list[groupIndex].items[itemIndex].value = capitalize($list[groupIndex].items[itemIndex].value);
    }

    function checkItem(groupIndex: number, itemIndex: number, pushHistory = true) {
        const item = $list[groupIndex].items[itemIndex];

        if (pushHistory) addHistory(HISTORY_STATE_TYPE.CHECK_ITEM, groupIndex, itemIndex, item.timestamp);

        item.checked = true;
        item.timestamp = Date.now();
        $list = $list;
    }

    function uncheckItem(groupIndex: number, itemIndex: number, timestamp?: number, pushHistory = true) {
        $list[groupIndex].items[itemIndex].checked = false;

        if (pushHistory) {
            addHistory(HISTORY_STATE_TYPE.UNCHECK_ITEM, groupIndex, itemIndex);
        } else {
            $list[groupIndex].items[itemIndex].timestamp = timestamp;
        }

        $list = $list;
    }

    function onCheckItem(groupIndex: number, itemIndex: number) {
        const item = $list[groupIndex].items[itemIndex];

        if (item.checked) {
            checkItem(groupIndex, itemIndex);
        } else {
            uncheckItem(groupIndex, itemIndex);
        }
    }

    function addGroup() {
        $list.push({
            name: '',
            items: []
        });
        $list = $list;
    }

    function removeGroup(groupIndex: number) {
        $list.splice(groupIndex, 1);
        $list = $list;
    }

    function renameGroup(groupIndex: number) {
        $list[groupIndex].name = capitalize($list[groupIndex].name);
    }

    function checkGroup(groupIndex: number) {
        for (const item of $list[groupIndex].items) {
            item.checked = true;
            item.timestamp = Date.now();
        }
        $list = $list;
    }

    function uncheckGroup(groupIndex: number) {
        for (const item of $list[groupIndex].items) {
            item.checked = false;
        }
        $list = $list;
    }

    function checkAll() {
        for (const [groupIndex] of $list.entries()) {
            checkGroup(groupIndex);
        }
    }

    function uncheckAll() {
        for (const [groupIndex] of $list.entries()) {
            uncheckGroup(groupIndex);
        }
    }

    function undo() {
        const lastEntry = undoHistory.pop();
        if (!lastEntry) return;

        const { type, groupIndex, itemIndex, data } = lastEntry;

        switch(type) {
            case HISTORY_STATE_TYPE.CHECK_ITEM:
                uncheckItem(groupIndex, itemIndex, data, false);
                console.log('checked item');
                break;
            case HISTORY_STATE_TYPE.UNCHECK_ITEM:
                checkItem(groupIndex, itemIndex, false);
                console.log('unchecked item');
                break;
        }

        undoHistory = undoHistory;
    }

    function redo() {
        const lastEntry = redoHistory.pop();

        if (!lastEntry) return;

        const { type, groupIndex, itemIndex, data } = lastEntry;

        switch(type) {
            case HISTORY_STATE_TYPE.CHECK_ITEM:
                uncheckItem(groupIndex, itemIndex, data, false);
                console.log('checked item');
                break;
            case HISTORY_STATE_TYPE.UNCHECK_ITEM:
                checkItem(groupIndex, itemIndex, false);
                console.log('unchecked item');
                break;
        }
    }

    function clear() {
        $list = sample;
    }
</script>

<div class="list">
    {#if !$list.length}
        <div class="list-empty">
            There's nothing here, consider adding something?
        </div>
    {/if}
    {#each $list as group, groupIndex (group)}
        {@const { items } = group}
        <div class="list-group">
            <div class="list-header">
                <input
                    class="list-group-input"
                    type="text"
                    placeholder="New group"
                    bind:value={group.name}
                    on:input={() => renameGroup(groupIndex)}
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
            {#each items as item, itemIndex (item)}
                {@const { checked, timestamp } = item}
                <div class="list-item" class:checked>
                    <div class="list-drag">
                        <FontAwesome name="grip-vertical" />
                    </div>
                    <label class="list-label">
                        <input type="checkbox" bind:checked={item.checked} on:change={() => onCheckItem(groupIndex, itemIndex)} />
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
                                autofocus={item === last}
                                bind:value={item.value}
                                on:input={() => renameItem(groupIndex, itemIndex)}
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
    <button type="button" on:click={clear}>Reset</button>
</div>

<div class="toolbar">
    <div class="toolbar-left">
        <button type="button" on:click={addGroup}>
            <FontAwesome name="square-plus" type="regular" />
        </button>
        <button type="button" class="history-control" disabled={!undoHistory.length} on:click={undo}>
            <FontAwesome name="arrow-rotate-left" />
        </button>
        <button type="button" class="history-control" disabled={!redoHistory.length} on:click={redo}>
            <FontAwesome name="arrow-rotate-right" />
        </button>
    </div>
    <div class="toolbar-right">
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
            order: 1;
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
