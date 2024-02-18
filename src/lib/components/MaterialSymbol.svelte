<script lang="ts">
    import 'material-symbols';
    import { type MaterialSymbol } from 'material-symbols';

    export let type: 'outlined' | 'rounded' | 'sharp' = 'outlined';
    export let name: MaterialSymbol;
    export let size: number | null = null;

    const fontWeight = type === 'outlined' ? 300 : 'initial';
</script>

<span class="material-symbol material-symbols-{type}" style:font-size={size + 'px'} style:font-weight={fontWeight}>
    {name}
</span>

<style lang="scss">
    .material-symbol {
        font-size: inherit;
    }
</style>