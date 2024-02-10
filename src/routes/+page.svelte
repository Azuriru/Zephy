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

    // function onpaste(e: ClipboardEvent) {
    //     e.preventDefault();

    //     const selection = window.getSelection();
    //     // Don't allow deleting nodes
    //     if (selection && selection?.anchorNode.isSameNode(selection.focusNode)) {
    //         // get text representation of clipboard
    //         const text = e.clipboardData.getData('text/plain');

    //         // insert text manually, but without new line characters as can't support <br/>s yet
    //         document.execCommand('insertHTML', false, text.replace(/\n/g, ''));
    //     }
    // }

    function _onKeyDown(e: KeyboardEvent) {
        const selection = window.getSelection();

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                break;
            case 'Backspace':
            case 'Delete':
            case 'Paste':
                // Don't allow deleting nodes
                if (!selection?.anchorNode?.isSameNode(selection.focusNode)) {
                    e.preventDefault();
                }
                break;
        }
    }

    function formatTimestamp(timestamp: number | undefined) {
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

        return `${pad(h)}:${pad(m)}:${pad(s)} ${pad(date)}/${pad(
            month + 1,
        )}/${year}`;
    }

    function onChange(groupIndex: number, itemIndex: number) {
        const item = $list[groupIndex].items[itemIndex];

        if (item.checked) {
            item.timestamp = Date.now();
        }

        $list = $list;
    }

    function addItem(value: string, groupIndex: number) {
        $list[groupIndex].items.push({ value });
        $list = $list;
    }

    function removeItem(groupIndex: number, itemIndex: number) {
        $list[groupIndex].items.splice(itemIndex, 1);
        $list = $list;
    }

    function addGroup(groupName: string) {}

    function removeGroup(groupIndex: number) {
        $list.splice(groupIndex, 1);
        $list = $list;
    }

    function checkGroup(groupIndex: number) {
        for (const item of $list[groupIndex].items) {
            item.checked = true;
            item.timestamp = Date.now();
        }
        $list = $list;
    }

    function checkAll() {
        for (const [groupIndex] of $list.entries()) {
            checkGroup(groupIndex);
        }
    }

    function uncheckGroup(groupIndex: number) {
        for (const item of $list[groupIndex].items) {
            item.checked = false;
        }
        $list = $list;
    }

    function uncheckAll() {
        for (const [groupIndex] of $list.entries()) {
            uncheckGroup(groupIndex);
        }
    }

    function findDuplicate(groupIndex: number, value: string) {
        return $list[groupIndex].items.some(
            (item: Item) => item.value === value,
        );
    }

    function focusOut(e: FocusEvent, groupIndex: number) {
        const { currentTarget } = e;
        if (!(currentTarget instanceof HTMLElement)) return;

        const items = currentTarget.innerText.split('\n');
        currentTarget.innerText = '';

        for (const item of items) {
            const value = item.toLowerCase();
            if (value && !findDuplicate(groupIndex, value)) {
                addItem(value, groupIndex);
            }
            $list = $list;
        }
    }

    function clear() {
        localStorage.removeItem('persistibles');
    }
</script>

<div class="list">
    <div class="list-options">
        <button>
            Add Group
            <FontAwesome name="plus" />
        </button>
        <button>
            Remove Group
            <FontAwesome name="minus" />
        </button>
        <button on:click={uncheckAll}>
            Uncheck all
            <FontAwesome name="xmark" />
        </button>
        <button on:click={checkAll}>
            Check all
            <FontAwesome name="check" />
        </button>
    </div>
    {#if $list}
        {#each $list as group, groupIndex (group)}
            {@const { name, items } = group}
            <div class="list-group">
                <div class="list-header">
                    <span>Group: {capitalize(name)}</span>
                    <div class="list-group-actions">
                        <button on:click={() => uncheckGroup(groupIndex)}>
                            <FontAwesome name="square" type="regular" />
                        </button>
                        <button on:click={() => checkGroup(groupIndex)}>
                            <FontAwesome name="square-check" type="regular" />
                        </button>
                    </div>
                </div>
                {#each items as { checked, value, timestamp }, itemIndex (value)}
                    <label class="list-item" class:checked>
                        <input
                            type="checkbox"
                            bind:checked
                            on:change={() => onChange(groupIndex, itemIndex)}
                        />
                        <div class="list-checkbox">
                            {#if checked}
                                <FontAwesome name="check" />
                            {/if}
                        </div>
                        <div class="list-item-info">
                            <span class="list-item-name">{value}</span>
                            <span class="list-item-timestamp"
                                >{formatTimestamp(timestamp)}</span
                            >
                        </div>
                        <button
                            class="list-item-remove"
                            on:click={() => removeItem(groupIndex, itemIndex)}
                        >
                            <FontAwesome name="xmark" />
                        </button>
                    </label>
                {/each}
                <div
                    class="list-last"
                    contenteditable="true"
                    on:focusout={(e) => focusOut(e, groupIndex)}
                />
            </div>
        {/each}
    {/if}
    <button on:click={clear}>Reset</button>
</div>

<style lang="scss">
    @mixin flex {
        display: flex;
    }

    @mixin flex-col {
        flex-direction: column;
    }

    @mixin center-y {
        @include flex;
        align-items: center;
    }

    @mixin center-x {
        @include flex;
        justify-content: center;
    }

    @mixin center {
        @include flex;
        align-items: center;
        justify-content: center;
    }

    @mixin divide-evenly {
        display: flex;
        justify-content: space-evenly;
    }

    .list {
        padding: 40px;
    }

    .list,
    .list-group,
    .list-item-info {
        display: flex;
        flex-direction: column;
    }

    .list-options {
        @include divide-evenly;
        margin-bottom: 20px;
    }
    .list-group {
        margin-bottom: 20px;
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .list-item {
        display: flex;
        align-items: center;
        padding: 12px 0;

        &.checked {
            order: 1;
            filter: brightness(0.5);
        }

        input {
            appearance: none;

            & + .list-checkbox {
                @include center;
                width: 20px;
                height: 20px;
                background: rgb(255, 255, 255, 0.1);
                color: #34d399;
                margin-right: 8px;
            }
        }

        .list-item-info {
            flex-grow: 1;
        }

        .list-item-name {
            text-transform: capitalize;
        }

        .list-item-timestamp {
            font-size: 12px;
            color: #848484;
        }

        .list-item-remove {
            @include center;
            width: 20px;
            height: 20px;
        }
    }

    .list-last {
        // background: blue;
        margin-left: 28px;
        order: 10;
    }
</style>
