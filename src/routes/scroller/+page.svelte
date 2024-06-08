<script lang="ts">
    let position = 0;

    function onWheel(e: WheelEvent) {
        position += e.deltaY;
    }
</script>


<div class="wrapper flex items-center justify-center h-full overflow-auto" on:wheel={onWheel}>
    <div class="img" style:transform="translateY({position}px)">
        <img src="/favicon.png" alt="test" />
    </div>
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow: auto;
    }

    .img {
        transition: .5s ease-out;
    }
</style>