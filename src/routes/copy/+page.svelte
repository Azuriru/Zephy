<script lang="ts">
    import * as clipboard from 'clipboard-polyfill';

    function copy(text: string) {
        clipboard.writeText(text).then(
            () => { alert('success!') },
            () => { alert('error!') }
        );
    }

    let input = '';
</script>

<div class="wrapper">
    <input bind:value={input} />
    <button type="button" on:click={() => (copy(input), input = '')}>Copy</button>
</div>

<style lang="scss">
    .wrapper {
        @include flex(column, centerX, centerY);
        gap: 8px;
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    .tools {
        @include flex(center, between);
        gap: 12px;
        width: 80%;

    }
    input {
        background: white;
        color: black;
        width: 33%;
    }

    textarea {
        width: 80%;
    }
</style>