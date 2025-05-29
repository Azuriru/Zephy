<script lang="ts">
    const copy = (str: string) => navigator.clipboard.writeText(str);
    const formatTimestamp = (date: Date) => {
        const dd = date.getDate();
        const mm = date.getMonth() + 1;
        const yyyy = date.getFullYear();

        const hh = date.getHours();
        const min = date.getMinutes();

        return `${dd}/${mm}/${yyyy} ${hh}:${min} ${hh < 12 ? 'AM' : 'PM'}`;
    };

    let input = '';
    let filename = formatTimestamp(new Date());

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
    <input bind:value={filename} />
    <div class="in-out">
        <div class="textarea">
            Input
            <textarea bind:value={input} rows={40} />
        </div>
        <div class="textarea">
            Output
            <textarea value={output} rows={40} />
        </div>
    </div>
    <div class="tools">
        <a href={URL.createObjectURL(download)} download="{filename}.txt" on:click={() => setTimeout(() => input = '', 500)}>Download</a>
        <button type="button" on:click={() => (copy(output), input = '')}>Copy</button>
        <span>Numbers: {linecount}</span>
    </div>
</div>

<style lang="scss">
    :global(body .app) {
        background: rgb(223, 223, 223);
        color: #181818;
    }

    .wrapper {
        @include flex(column, centerX, centerY);
        gap: 8px;
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    .in-out {
        @include flex();
        width: 80%;
        gap: 8px;

        .textarea {
            @include flex(column);
            gap: 4px;
            width: 50%;
        }
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
        border: 1px solid black;
        padding: 0 2px;
    }
</style>