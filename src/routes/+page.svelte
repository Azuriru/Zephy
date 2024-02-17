<script lang="ts">
    import { readable } from 'svelte/store';
    import { type Group, TodosHistory } from '$lib/util/list';
    import { capitalize, clone } from '$lib/util';
    import { persistibles } from '$lib/util/store';
    import { locale, t } from '$lib/i18n';
    import langs from '$lib/i18n/lang.json';
    import { FontAwesome } from '$lib/components';

    const language = persistibles<string>('language', 'en');

    function onLanguageChange (language: string){
        $locale = language;
        $language = language;
    }

    type InputEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

    let dark = false;
    const todosHistory = readable<TodosHistory>(null as never, (set) => {
        const hist = new TodosHistory(set, {
            groups: []
        });

        set(hist);
    });

    function formatTimestamp(timestamp?: number) {
        if (!timestamp) {
            return '';
        }

        const d = new Date(timestamp);
        const h = d.getHours();
        const m = d.getMinutes();
        const s = d.getSeconds();

        const date = d.getDate();
        const month = d.getMonth();
        const year = d.getFullYear();

        const pad = (number: number) => number.toString().padStart(2, '0');

        return `${pad(h)}:${pad(m)}:${pad(s)} ${pad(date)}/${pad(
            month + 1
        )}/${year}`;
    }

    function addItem(groupIndex: number) {
        $todosHistory.do({
            type: 'add',
            itemIndex: $todosHistory.state.groups[groupIndex].items.length,
            groupIndex,
            item: {
                value: '',
                id: Math.floor(Math.random() * 1e20),
                checked: false,
                timestamp: null
            }
        });
    }

    function removeItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'remove',
            itemIndex,
            groupIndex,
            removed: clone($todosHistory.state.groups[groupIndex].items[itemIndex])
        });
    }

    function editItem(e: InputEvent, groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'edit',
            itemIndex,
            groupIndex,
            previous: $todosHistory.state.groups[groupIndex].items[itemIndex],
            edited: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex],
                value: capitalize(e.currentTarget.value)
            }
        });
    }

    function checkItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'check',
            itemIndex,
            groupIndex,
            previous: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex]
            },
            edited: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex],
                checked: true,
                timestamp:  Date.now()
            }
        });
    }

    function uncheckItem(groupIndex: number, itemIndex: number) {
        $todosHistory.do({
            type: 'uncheck',
            itemIndex,
            groupIndex,
            previous: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex]
            },
            edited: {
                ...$todosHistory.state.groups[groupIndex].items[itemIndex],
                checked: false,
                timestamp: null
            }
        });
    }

    function onCheckItem(groupIndex: number, itemIndex: number) {
        if ($todosHistory.state.groups[groupIndex].items[itemIndex].checked) {
            uncheckItem(groupIndex, itemIndex);
        } else {
            checkItem(groupIndex, itemIndex);
        }
    }

    function addGroup() {
        $todosHistory.do({
            type: 'add-group',
            groupIndex: $todosHistory.state.groups.length,
            group: {
                items: [],
                name: '',
                id: Math.floor(Math.random() * 1e20)
            }
        });
    }

    function removeGroup(groupIndex: number) {
        $todosHistory.do({
            type: 'remove-group',
            groupIndex,
            removed: clone($todosHistory.state.groups[groupIndex])
        });
    }

    function editGroup(e: InputEvent, groupIndex: number) {
        $todosHistory.do({
            type: 'edit-group',
            groupIndex,
            previous: clone($todosHistory.state.groups[groupIndex]),
            edited: {
                ...$todosHistory.state.groups[groupIndex],
                name: capitalize(e.currentTarget.value)
            }
        });
    }

    function checkGroup(groupIndex: number) {
        if ($todosHistory.state.groups[groupIndex].items.every((item) => item.checked)) return;

        const edited: Group = clone($todosHistory.state.groups[groupIndex]);

        for (const item of edited.items) {
            item.checked = true;
            item.timestamp = Date.now();
        }

        $todosHistory.do({
            type: 'check-group',
            groupIndex,
            previous: clone($todosHistory.state.groups[groupIndex]),
            edited
        });
    }

    function uncheckGroup(groupIndex: number) {
        if (!$todosHistory.state.groups[groupIndex].items.every((item) => item.checked)) return;

        const edited: Group = clone($todosHistory.state.groups[groupIndex]);

        for (const item of edited.items) {
            item.checked = false;
            item.timestamp = null;
        }

        $todosHistory.do({
            type: 'uncheck-group',
            groupIndex,
            previous: clone($todosHistory.state.groups[groupIndex]),
            edited
        });
    }

    function removeAll() {
        $todosHistory.do({
            type: 'remove-all',
            removed: $todosHistory.state.groups
        });
    }

    function checkAll() {
        if ($todosHistory.state.groups.every(group => group.items.every((item) => item.checked))) return;

        const edited: Group[] = clone($todosHistory.state.groups);

        for (const group of edited) {
            for (const item of group.items) {
                item.checked = true;
                item.timestamp = Date.now();
            }
        }

        $todosHistory.do({
            type: 'check-all',
            previous: clone($todosHistory.state.groups),
            edited
        });
    }

    function uncheckAll() {
        if (!$todosHistory.state.groups.every(group => group.items.every((item) => item.checked))) return;

        const edited: Group[] = clone($todosHistory.state.groups);

        for (const group of edited) {
            for (const item of group.items) {
                item.checked = false;
                item.timestamp = null;
            }
        }

        $todosHistory.do({
            type: 'check-all',
            previous: clone($todosHistory.state.groups),
            edited
        });
    }
</script>

<div class="list-app" class:light={!dark}>
    <div class="list">
        {#if !$todosHistory.state.groups.length}
            <div class="list-empty">
                There's nothing here, consider adding something?
            </div>
        {/if}
        {#each $todosHistory.state.groups as group, groupIndex (group.id)}
            {@const { name: value, items } = group}
            <div class="list-group">
                <div class="list-header">
                    <input
                        class="list-group-input"
                        type="text"
                        name="group-name"
                        placeholder={$t('list.group-placeholder')}
                        {value}
                        on:input={(e) => editGroup(e, groupIndex)}
                    />
                    <div class="list-group-actions">
                        <button type="button" on:click={() => removeGroup(groupIndex)}>
                            <FontAwesome name="trash-can" type="regular" />
                        </button>
                        <button type="button" on:click={() => uncheckGroup(groupIndex)}>
                            <FontAwesome name="square" type="regular" />
                        </button>
                        <button type="button" on:click={() => checkGroup(groupIndex)}>
                            <FontAwesome name="square-check" type="regular" />
                        </button>
                    </div>
                </div>
                {#each items as item, itemIndex (item.id)}
                    {@const { value, checked, timestamp } = item}
                    <div class="list-item" class:checked>
                        <div class="list-drag">
                            <FontAwesome name="grip-vertical" />
                        </div>
                        <label class="list-label">
                            <input
                                type="checkbox"
                                name="item-checkbox"
                                {checked}
                                on:change={() => onCheckItem(groupIndex, itemIndex)}
                            />
                            <div class="list-checkbox">
                                {#if checked}
                                    <FontAwesome name="check" />
                                {/if}
                            </div>
                            <div class="list-item-info">
                                <input
                                    class="list-item-name"
                                    type="text"
                                    name="item-name"
                                    placeholder={$t('list.item-placeholder')}
                                    {value}
                                    on:input={(e) => editItem(e, groupIndex, itemIndex)}
                                />
                                {#if timestamp}
                                    <span class="list-item-timestamp">
                                        {formatTimestamp(timestamp)}
                                    </span>
                                {/if}
                            </div>
                        </label>
                        <button
                            type="button"
                            class="list-item-remove"
                            on:click={() => removeItem(groupIndex, itemIndex)}
                        >
                            <FontAwesome name="xmark" />
                        </button>
                    </div>
                {/each}
                <button
                    type="button"
                    class="list-last"
                    on:click={() => addItem(groupIndex)}
                >
                    <div class="list-plus">
                        <FontAwesome name="plus" />
                    </div>
                    <span class="list-plus-text">{$t('list.item-add')}</span>
                </button>
            </div>
        {/each}
    </div>

    <div class="toolbar">
        <div class="toolbar-left">
            <button type="button" on:click={() => addGroup()}>
                <FontAwesome name="square-plus" type="regular" />
            </button>
            <button
                type="button"
                class="history-control"
                disabled={$todosHistory.index === 0}
                on:click={() => $todosHistory.undo()}
            >
                <FontAwesome name="arrow-rotate-left" />
            </button>
            <button
                type="button"
                class="history-control"
                disabled={$todosHistory.index === $todosHistory.events.length}
                on:click={() => $todosHistory.redo()}
            >
                <FontAwesome name="arrow-rotate-right" />
            </button>
        </div>
        <div class="toolbar-right">
            <!-- {#each Object.keys(langs) as language (language)}
                <button type="button" on:click={() => onLanguageChange(language)}>{langs[language]}</button>
            {/each} -->
            <input
                type="checkbox"
                name="item-checkbox"
                on:change={() => dark = !dark}
            />
            <button type="button" on:click={removeAll}>
                <FontAwesome name="trash-can" type="regular" />
            </button>
            <button type="button" on:click={uncheckAll}>
                <FontAwesome name="square" type="regular" />
            </button>
            <button type="button" on:click={checkAll}>
                <FontAwesome name="square-check" type="regular" />
            </button>
            <button type="button">
                <FontAwesome name="sliders" />
            </button>
        </div>
    </div>

    <div class="settings">
        <div />
    </div>

</div>

<style lang="scss">
    .list-app {
        --background: #181818;
        --color: #eee;
        --color-accent: #848484;
        --color-placeholder: #ffffff4d;
        --color-outer: var(--color);
        --color-outer-placeholder: var(--color-placeholder);
        --item-background: transparent;
        --item-background-hover: #272727;
        --selection-background: #00ffff80;
        --toolbar-background: #20232c;
        --checkbox-background: #ffffff1a;
        --checkbox-checked: #009d9d;
        --checkbox-border: transparent;
        --checkbox-border-checked: transparent;
        --radius: 0;
    }

    .list-app.light {
        --background: linear-gradient(to bottom right, #5ab3ae, #74B4B4);
        --color: black;
        --color-accent: #848484;
        --color-placeholder: #00000080;
        --color-outer: white;
        --color-outer-placeholder: #ffffff80;
        --item-background: #fcfcfc;
        --item-background-hover: #96d6d6;
        --selection-background: #00ffff80;
        --toolbar-background: #009797;
        --checkbox-background: #0000000d;
        --checkbox-border: var(--color);
        --checkbox-border-checked: var(--checkbox-checked);
        --checkbox-checked: #009d9d;
        --radius: 4px;
        font-weight: 500;
    }

    // Colors
    $selection: var(--selection-background);
    $background: var(--background);
    $color: var(--color);
    $color-accent: var(--color-accent);
    $color-placeholder: var(--color-placeholder);
    $color-outer: var(--color-outer);
    $color-outer-placeholder: var(--color-outer-placeholder);
    $item-background: var(--item-background);
    $item-background-hover: var(--item-background-hover);
    $item-transition: background-color 0.5s;
    $toolbar-background: var(--toolbar-background);
    $checkbox-background: var(--checkbox-background);
    $checkbox-checked: var(--checkbox-checked);
    $checkbox-border: var(--checkbox-border);
    $checkbox-border-checked: var(--checkbox-border-checked);
    $radius: var(--radius);

    $cube: 36px;
    $checkbox: 24px;

    ::selection {
        background-color: $selection;
    }

    ::placeholder {
        color: $color-placeholder;
    }

    .list-app {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: $background;
        color: $color;
    }

    .toolbar {
        @include flex(between);
        padding: 8px;
        position: sticky;
        bottom: 0;
        top: 100%;
        background: $toolbar-background;
        color: $color-outer;
        font-size: 24px;

        .toolbar-left,
        .toolbar-right {
            display: flex;

            button:not(:first-of-type) {
                margin-left: 8px;
            }
        }

        .history-control {
            font-size: 20px;

            &:disabled {
                filter: opacity(0.5);
            }
        }
    }

    .list {
        flex-grow: 1;
        padding: 40px 20px;
        overflow: auto;
    }

    .list-empty {
        @include flex(center, one);
        text-align: center;
        color: $color-outer;
    }

    .list,
    .list-group,
    .list-item-info {
        @include flex(column);
    }

    .list-group {
        margin-bottom: 20px;
    }

    .list-header {
        @include flex(between);
        padding: 0 8px 0 6px;
        margin-bottom: 10px;
        color: $color-outer;

        ::placeholder {
            color: $color-outer-placeholder;
        }

        .list-group-input {
            @include flex;
            width: 100%;
        }

        .list-group-actions {
            @include flex;
            font-size: 18px;

            button {
                @include flex(center);
                width: 20px;
                height: 20px;

                &:not(:first-of-type) {
                    margin-left: 8px;
                }
            }
        }
    }

    .list-item {
        @include flex;
        height: 36px;
        border-radius: $radius;
        background: $item-background;
        transition: $item-transition;

        &:hover,
        &:active {
            background: $item-background-hover;
        }

        // &:not(:nth-last-of-type(2)) {
        margin-bottom: 4px;
        // }

        &.checked {
            // order: 1;
            // filter: opacity(0.5);
        }

        .list-drag {
            @include flex(center, noShrink);
            width: $cube;
            height: $cube;
        }

        .list-label {
            @include flex(centerY, one);
            input {
                appearance: none;

                & + .list-checkbox {
                    @include flex(center, noShrink);
                    width: $checkbox;
                    height: $checkbox;
                    margin-right: 8px;
                    background: $checkbox-background;
                    border: 2px solid $checkbox-border;
                    border-radius: $radius;
                    color: white;
                }

                &:checked + .list-checkbox {
                    border-color: $checkbox-border-checked;
                    color: $checkbox-checked;
                    // background: $checkbox-background-checked;
                }
            }

            .list-item-info {
                flex-grow: 1;

                .list-item-name {
                    width: 100%;
                }

                .list-item-timestamp {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    color: $color-accent;
                }
            }
        }

        .list-item-remove {
            @include flex(center, noShrink);
            width: $cube;
            height: $cube;
        }
    }

    .list-last {
        @include flex(centerY);
        height: $cube;
        padding-left: $cube;
        order: 10;
        transition: $item-transition;
        border-radius: $radius;
        color: $color-outer;

        &:hover,
        &:active {
            background: $item-background-hover;
        }

        .list-plus {
            @include flex(center, noShrink);
            width: $checkbox;
            height: $checkbox;
            margin-right: 8px;
        }

        .list-plus-text {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
</style>
