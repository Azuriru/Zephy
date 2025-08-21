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

    // function a(n) {
    //     'use strict';
    //     let r = getSelection();
    //     let i = {
    //         'text/plain': 'Text',
    //         'text/html': 'Url',
    //         'default': 'Text'
    //     };

    //     let copy = function(e, t) {
    //         var n,
    //             a,
    //             o,
    //             s,
    //             l,
    //             c,
    //             u = !1;
    //         t || (t = {}),
    //         n = t.debug || !1;
    //         try {
    //             if (o = r(),
    //             s = document.createRange(),
    //             l = document.getSelection(),
    //             (c = document.createElement('span')).textContent = e,
    //             c.ariaHidden = 'true',
    //             c.style.all = 'unset',
    //             c.style.position = 'fixed',
    //             c.style.top = 0,
    //             c.style.clip = 'rect(0, 0, 0, 0)',
    //             c.style.whiteSpace = 'pre',
    //             c.style.webkitUserSelect = 'text',
    //             c.style.MozUserSelect = 'text',
    //             c.style.msUserSelect = 'text',
    //             c.style.userSelect = 'text',
    //             c.addEventListener('copy', function(r) {
    //                 if (r.stopPropagation(),
    //                 t.format) if (r.preventDefault(),
    //                 'undefined' === typeof r.clipboardData) {
    //                     n && console.warn('unable to use e.clipboardData'),
    //                     n && console.warn('trying IE specific stuff'),
    //                     window.clipboardData.clearData();
    //                     var a = i[t.format] || i.default;
    //                     window.clipboardData.setData(a, e);
    //                 } else r.clipboardData.clearData(),
    //                 r.clipboardData.setData(t.format, e);
    //                 t.onCopy && (r.preventDefault(),
    //                 t.onCopy(r.clipboardData));
    //             }),
    //             document.body.appendChild(c),
    //             s.selectNodeContents(c),
    //             l.addRange(s),
    //             !document.execCommand('copy')) throw new Error('copy command was unsuccessful');
    //             u = !0;
    //         } catch (d) {
    //             n && console.error('unable to copy using execCommand: ', d),
    //             n && console.warn('trying IE specific stuff');
    //             try {
    //                 window.clipboardData.setData(t.format || 'text', e),
    //                 t.onCopy && t.onCopy(window.clipboardData),
    //                 u = !0;
    //             } catch (d) {
    //                 n && console.error('unable to copy using clipboardData: ', d),
    //                 n && console.error('falling back to prompt'),
    //                 a = function(e) {
    //                     var t = ((/mac os x/i).test(navigator.userAgent) ? '\u2318' : 'Ctrl') + '+C';

    //                     return e.replace(/#{\s*key\s*}/g, t);
    //                 }('message' in t ? t.message : 'Copy to clipboard: #{key}, Enter'),
    //                 window.prompt(a, e);
    //             }
    //         } finally {
    //             l && ('function' == typeof l.removeRange ? l.removeRange(s) : l.removeAllRanges()),
    //             c && document.body.removeChild(c),
    //             o();
    //         }

    //         return u;
    //     };
    // }

    function copyText(text: string): Promise<void> {
        if (typeof navigator !== 'undefined' && 'clipboard' in navigator && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else if ((window as any).clipboardData && (window as any).clipboardData.setData) {
            try {
                (window as any).clipboardData.setData('Text', text);

                return Promise.resolve();
            } catch (e) {
                return Promise.reject(e);
            }
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch {
                ok = false;
            }
            document.body.removeChild(ta);

            return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
        }
    }

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
    <button type="button" on:click={() => (copyText(input), input = '')}>Copy</button>
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