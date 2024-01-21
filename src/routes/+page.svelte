<script lang="ts">
    import { localStorageCentralized } from '$lib/util/store';
    import sample from './default.json';

    type Item = {
        value: string;
        checked?: boolean;
        timestamp?: number;
    };

    type Group = {
        name: string;
        items: Item[]
    }

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

        switch(e.key) {
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
            return 'unknown';
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

    function onChange(group: number, index: number) {
        const item = $list[group].items[index]

        if (item.checked) {
            item.timestamp = Date.now();
        }

        $list = $list;
    }

    function uncheckAll() {
        // for (const group in $list) {
        //     for (const item of $list[group]) {
        //         item.checked = false;
        //     }
        // }
        $list = $list;
    }

    function clear() {
        localStorage.removeItem('persistibles');
    }

    console.log($list);
</script>

<div class="list">
    {#if $list}
        {#each $list as group, groupIndex}
            {@const { name, items } = group}
            <div class="list-group">
                <div class="list-header">Group: {name}</div>
                {#each items as { checked, value, timestamp }, itemIndex}
                    <label class="list-item">
                        <input class="list-checkbox" type="checkbox" bind:checked={checked} on:change={() => onChange(groupIndex, itemIndex)}>
                        <div class="list-item-info">
                            <span class="list-item-name">{value}</span>
                            <span class="list-item-timestamp">{formatTimestamp(timestamp)}</span>
                        </div>
                    </label>
                {/each}
            </div>
        {/each}
    {/if}
    <button on:click={uncheckAll}>uncheck all</button>
    <button on:click={clear}>clear all</button>
</div>

<style lang="scss">
    .list {
        padding: 40px 80px;
    }

    .list,
    .list-group,
    .list-item-info  {
        display: flex;
        flex-direction: column;
    }

    .list-group {
        margin-bottom: 20px;
    }

    .list-header {
        margin-bottom: 10px;
    }

    .list-item {
        display: flex;
        align-items: center;
        padding: 12px 0;

        .list-item-name {
            text-transform: capitalize;
        }

        .list-item-timestamp {
            font-size: 12px;
            color: #848484;
        }
    }
</style>
