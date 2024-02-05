<script lang="ts">
    import './styles.css';

// if ('serviceWorker' in navigator) {
    //     addEventListener('load', function () {
    //         navigator.serviceWorker.register('./service-worker.js');
    //     });
    // }
</script>

<svelte:head>
    <title>List</title>
</svelte:head>

<div class="main-screen">
    <slot />
</div>
