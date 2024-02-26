<script lang="ts">
    import type { FormEventHandler, KeyboardEventHandler } from 'svelte/elements';
    export let placeholder;
    export let value;
    export let onInput: FormEventHandler = () => {}
    export let onKeydown: KeyboardEventHandler = () => {};

    function onMount(node: HTMLInputElement) {
        node.focus();
    }
</script>

<input
    class="list-item-name"
    type="text"
    name="item-name"
    {placeholder}
    {value}
    on:input={onInput}
    on:keydown={onKeydown}
    use:onMount
/>