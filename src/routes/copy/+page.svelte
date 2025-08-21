<script lang="ts">
    function getSelection() {
        const e = document.getSelection();

        let element: HTMLElement | null = null;
        let selected: Range[] = [];
        let selectedIndex = 0;

        if (!e) return null;
        if (!e.rangeCount) return null;

        for (element = document.activeElement as HTMLElement; selectedIndex < e.rangeCount; selectedIndex++) {
            selected.push(e.getRangeAt(selectedIndex));
        }

        if (!element) return null;

        switch(element.tagName.toUpperCase()) {
            case 'INPUT':
            case 'TEXTAREA':
                element.blur();
                break;
            default:
                element = null;
        }

        e.removeAllRanges();

        if ('Caret' === e.type) {
            e.removeAllRanges();
        }

        if (!e.rangeCount) {
            selected.forEach((t) => {
                e.addRange(t);
            });
        }

        if (element) {
            element.focus();
        }
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else if (window.clipboardData && window.clipboardData.setData) {
            try {
                window.clipboardData.setData('Text', text); // IE

                return Promise.resolve();
            } catch (e) {
                return Promise.reject(e);
            }
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy') } catch (e) { ok = false }
            document.body.removeChild(ta);

            return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
        }
    }

    function copyFromEl(id) {
        var el = document.getElementById(id);
        var text = el && (el.value || el.textContent || '');
        copyText(text).catch(function() {
            // absolute last resort for cursed browsers
            alert('Couldn’t auto-copy. Press Ctrl/Cmd+C to copy manually.');
        });
    }
    let input = '';
</script>

<div class="wrapper">
    <input id="toCopy" bind:value={input} />
    <button type="button" on:click={() => (copyFromEl('toCopy'), input = '')}>Copy</button>
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