<script lang="ts">
    const copy = (str: string) => navigator.clipboard.writeText(str);

    let filename = (new Date).toLocaleDateString();
    let input = new Array(30)
        .fill(null)
        .map((_) => {
            if (Math.random() < 0.2) return '';

            const random = Array(7).fill(null).map(() => Math.floor(Math.random() * 10)).join('');
            const six = Math.random() < 0.5 ? '60' : '0';
            const nosix = Math.random() < 0.5 ? six : '';
            const dash = Math.random() < 0.5 ? '-' : '';
            const prefix = `${Math.random() < 0.5 ? '1' : '3'}${Math.floor(Math.random() * 10)}`;

            return `${nosix}${prefix}${dash}${random}`;
        })
        .join('\n');
    $: output = Array.from(new Set(input
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
        .filter(Boolean)))
    .join('\n')
    $: linecount = output.split('\n').filter(Boolean).length;
    $: download = new Blob([output], { type: 'text/plain' });
</script>

<div class="wrapper">
    <textarea bind:value={input} rows={40} />
    <input bind:value={filename} />
    <textarea value={output} rows={40} />
    <div class="tools">
        <span>Numbers: {linecount}</span>
        <a href={URL.createObjectURL(download)} download="{filename}.txt">Download</a>
        <button type="button" on:click={() => copy(output)}>Copy</button>
    </div>
</div>

<style lang="scss">
    .wrapper {
        height: 100%;
        @include flex(column, centerX, centerY);
        gap: 8px;
        width: 100%;
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
