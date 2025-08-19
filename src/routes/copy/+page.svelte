<script lang="ts">
    function copy(text: string) {
        if (window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = text;
        textarea.select();

        document.execCommand('copy');
        document.body.removeChild(textarea);
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