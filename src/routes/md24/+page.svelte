<script lang="ts">
    import { tick } from 'svelte';
    import choices from './+page.json';

    // const colors = ['#ffb63bcc', '#ff1a1acc'] as const;
    // const colors = ['#ff1a1acc', '#ff8484cc'] as const;

    type Choice = {
        name: string;
        type: string;
        map: string;
        location: string;
        info: string;
        ratio: number;
    };
    type NullChoice = {
        name: 'null';
        ratio: number;
    };
    const segments: (NullChoice | Choice)[] = choices.map((item) => ({
        ...item,
        ratio: 2
    }));
    segments.splice(segments.length / 2, 0, {
        name: 'null',
        ratio: 3
    });
    segments.push({
        name: 'null',
        ratio: 3
    });

    const colors = ['#ffffff80', '#ffcf9033'] as const;

    type Segment = {
        color: string;
        offset: number;
        offsetEnd: number;
    };
    let spanned = 0;
    let transformDeg = 0;
    let isSpinning: false | (Segment & Choice) = false;
    let spinResult: null | (Segment & Choice) = null;

    const minSpin = 8;
    const max = segments.reduce((sum, segment) => sum + segment.ratio, 0);
    const conics = segments.map((segment, i) => {
        const breadth = 360 / max * segment.ratio;
        const offset = spanned;
        const offsetEnd = spanned + breadth;

        spanned += breadth;

        // return `${colors[i % 2]} ${offset}deg ${offsetEnd}deg`;

        return {
            ...segment,
            color: colors[i % 2],
            offset,
            offsetEnd
        };
    });

    function getConicGradient() {
        return conics
            .map(({ color, offset, offsetEnd }) => `${color} ${offset}deg ${offsetEnd}deg`)
            .join(', ');
    }

    function onTransitionEnd(e: TransitionEvent) {
        transformDeg = transformDeg % 360;

        const { currentTarget } = e;

        if (!(currentTarget instanceof HTMLElement)) return;

        currentTarget.style.transition = 'none';
        currentTarget.offsetTop;
        tick().then(() => {
            currentTarget.offsetTop;
            currentTarget.style.transition = '';
            spinResult = isSpinning as (Segment & Choice);
            isSpinning = false;
        });
    }

    function spin() {
        if (isSpinning) return;

        const result = Math.floor(Math.random() * choices.length);

        const segment = conics.find((segment) => {
            return segment.name === choices[result].name;
        })!;

        if (!segment) return;

        const offset = Math.floor(Math.random() * (segment.offsetEnd - segment.offset + 1));

        transformDeg = 360 * minSpin + (360 - segment.offset) - offset + 90;
        isSpinning = segment as (Segment & Choice);
    }
</script>

<div class="spin-area">
    <div class="wheel-area">
        <div class="wheel-wrapper">
            <div class="wheel" on:transitionend={onTransitionEnd} style:transform="rotate({transformDeg}deg)" style:background="conic-gradient({getConicGradient()})">
                {#each conics as segment, index (index)}
                    {@const color = index % 2 ? 'text-yellow-100' : 'text-red-500'}
                    {@const deg = segment.offset + (segment.offsetEnd - segment.offset) / 2}
                    <div class="wheel-item {color}" style:transform="rotate({deg}deg)">
                        <div style:transform="rotate(-90deg)">
                            {segment.name === 'null'
                                ? 'She choose'
                                : segment.name.split(' ').map((string) => string.slice(0, 1)).join('')}
                        </div>
                    </div>
                {/each}
            </div>
            <button type="button" class="spin-button" on:click={spin}>
                Spin!
            </button>
        </div>
        <img class="frame" src="/frame.png" alt="wheel-border" />
    </div>

    <div class="results">
        {#if spinResult}
            {@const { name, type, location, map, info } = spinResult}
            <span>You chose: {name}</span>
            <span>Location: <a href={map}>{location}</a></span>
            <span>Type: {type}</span>
            {#if info}
                <a href={info}>Extra information</a>
            {/if}
            <hr />
        {/if}
    </div>
    <div class="results-list">
        <span>Possible results</span>
        {#each choices as choice, index (choice)}
            {#if index !== 0}
                <hr />
            {/if}
            {@const { name, type, location, map, info } = choice}
            <div class="result">
                <span>{name}</span>
                <span>Location: <a href={map}>{location}</a></span>
                <span>Type: {type}</span>
                {#if info}
                    <a href={info}>Extra information</a>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    a {
        color: lightblue;
    }

    hr {
        width: 100%;
    }

    .spin-area {
        display: flex;
        flex-direction: column;
        // margin: auto;
        justify-content: safe center;
        align-items: safe center;;
        overflow: auto;
        padding: 40px 0;
    }

    .results {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        line-height: 30px;

        hr {
            margin: 20px 0;
        }
    }

    .results-list {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        line-height: 30px;
        margin-bottom: 40px;

        .result {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
    }

    .wheel-area {
        @include flex(center);
        width: 384px;
        height: 384px;
        padding: 40px;
        position: relative;
        flex-shrink: 0;

        .wheel-wrapper {
            @include flex(center);
            height: 100%;
            width: 100%;
            border-radius: 100%;
            overflow: hidden;
            position: relative;
            background: white url('/background.jpg') center / cover;
        }

        .wheel {
            width: 100%;
            height: 100%;
            font-weight: 600;
            font-size: 16px;
            transition: 5s ease-out;
            text-align: center;

            .wheel-item {
                position: absolute;
                width: 100%;
                height: 100%;
                padding-top: 48px;
                color: black;
            }
        }

        .spin-button {
            @include flex(center);
            align-self: center;
            width: 80px;
            height: 80px;
            border-radius: 100%;
            background: #dd0060;
            font-size: 18px;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: absolute;
            text-align: center;
            border: 3px solid #ffe9cb;
            color: #ffe9cb;

            &::after {
                content: '';
                width: 0;
                height: 0;
                transform: translateX(calc(50% + 32px));
                border-left: 18px solid #dd0060;
                border-top: 14px solid transparent;
                border-bottom: 14px solid transparent;
                position: absolute;
            }

            &::before {
                content: '';
                width: 0;
                height: 0;
                // left: 100%;
                transform: translateX(calc(50% + 36px));
                border-left: 20px solid #ffe9cb;
                border-top: 16px solid transparent;
                border-bottom: 16px solid transparent;
                position: absolute;
            }
        }

        .frame {
            max-width: 100%;
            width: 370px;
            user-select: none;
            pointer-events: none;
            position: absolute;
        }
    }
</style>