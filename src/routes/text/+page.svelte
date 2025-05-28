<script lang="ts">
    const copy = (str: string) => navigator.clipboard.writeText(str);

    let filename = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    let input = '';

    $: output = Array.from(new Set(
        input
            .split('\n')
            .map((line) => {
                line = line.replace(/[^0-9]/g, '');

                if (!line) return;

                line = line.replace(/^60|^0/, '');

                if (!line.startsWith('1')) return;

                return line
                    .replace(/^/, '0')
                    .replaceAll('-', '')
                    .replaceAll(' ', '');
            })
            .filter((line) => {
                if (!line) return false;

                const { length } = line;

                return length >= 10 && length <= 11;
            })
    ))
        .join('\n');
    $: linecount = output.split('\n').filter(Boolean).length;
    $: download = new Blob([output], { type: 'text/plain' });

</script>

<div class="wrapper">
    <textarea bind:value={input} rows={40} />
    <input bind:value={filename} />
    <textarea value={output} rows={40} />
    <div class="tools">
        <span>Numbers: {linecount}</span>
        <a href={URL.createObjectURL(download)} download="{filename}.txt" on:click={() => setTimeout(() => input = '', 500)}>Download</a>
        <button type="button" on:click={() => (copy(output), input = '')}>Copy</button>
    </div>
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