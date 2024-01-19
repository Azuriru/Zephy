<script lang="ts">
    import { localStorageCentralized } from '$lib/util/store';
    import sample from './default.json';

    type Items = Record<string, {
        value: string;
        checked?: boolean;
    }[]>;
    let items = localStorageCentralized<Items>('list', sample);

    // for dev
    for (const x of Object.keys($items || {})) {
        console.log($items[x]);
    }

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

    function onKeyDown(e: KeyboardEvent) {
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
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="list" contenteditable="true" on:keydown={onKeyDown}>
    {#if $items}
        {#each Object.keys($items) as group}
            <div class="group">
                Group: {group}
                {#each $items[group] as { value, checked }}
                    <div class="item">
                        <input type="checkbox" bind:checked={checked}>
                        {value}
                    </div>
                {/each}
            </div>
        {/each}
    {/if}
</div>
