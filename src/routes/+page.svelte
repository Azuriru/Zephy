<script lang="ts">
    import { readable } from 'svelte/store';
    import { type Group, TodosHistory } from '$lib/util/list';
    import { capitalize, clone } from '$lib/util';
    import { persistibles } from '$lib/util/store';
    import { defaultLocale, locale, t } from '$lib/i18n';
    import { MaterialSymbol } from '$lib/components';
    import langs from '$lib/i18n/lang.json';

    const language = persistibles<string>('language', defaultLocale);
    const flags = {
        en: '🇬🇧',
        ru: '🇷🇺',
        id: '🇮🇩',
        tl: '🇵🇭',
        zh: '🇨🇳'
    };

    type SettingsState = {
        theme: boolean,
        show_drag: boolean,
        show_remove_prompt: boolean,
        dehoist: boolean,
        merge_check_actions: boolean,
        autofocus: boolean,
        strike_completed: boolean
    };
    const settings = persistibles<SettingsState>('settings', {
        theme: false,
        show_drag: true,
        show_remove_prompt: false,
        dehoist: true,
        merge_check_actions: false,
        autofocus: true,
        strike_completed: false
    });

    let settingsHidden = false;
    let languageHidden = true;

    function onLanguageChange(language: string) {
        $locale = language;
        $language = language;
    }

    type InputEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

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

    function onClick(e: MouseEvent) {
        if (settingsHidden) return;

        if (e.target instanceof HTMLElement) {
            if (e.target.closest('.settings-button')) return;

            if (!e.target.closest('.settings-inner')) {
                settingsHidden = true;
            }
        }
    }
</script>

<svelte:window on:click={onClick} />

<div class="list-app" class:light={$settings.theme}>
    <div class="list">
        {#if !$todosHistory.state.groups.length}
            <div class="list-empty">
                {$t('list.empty')}
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
                            <MaterialSymbol name="delete" />
                        </button>
                        <button type="button" on:click={() => uncheckGroup(groupIndex)}>
                            <MaterialSymbol name="check_box_outline_blank" />
                        </button>
                        <button type="button" on:click={() => checkGroup(groupIndex)}>
                            <MaterialSymbol name="check_box" />
                        </button>
                    </div>
                </div>
                {#each items as item, itemIndex (item.id)}
                    {@const { value, checked, timestamp } = item}
                    <div class="list-item" class:checked>
                        <div class="list-drag">
                            <MaterialSymbol name="drag_indicator" />
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
                                    <MaterialSymbol name="check" />
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
                            <MaterialSymbol name="close" />
                        </button>
                    </div>
                {/each}
                <button
                    type="button"
                    class="list-last"
                    on:click={() => addItem(groupIndex)}
                >
                    <div class="list-plus">
                        <MaterialSymbol name="add_box" />
                    </div>
                    <span class="list-plus-text">{$t('list.item-add')}</span>
                </button>
            </div>
        {/each}
    </div>

    <div class="settings" class:hidden={settingsHidden}>
        <div class="settings-overlay" />
        <div class="settings-inner">
            <button type="button" class="settings-close" on:click={() => settingsHidden = true}>
                <MaterialSymbol name="close" />
            </button>
            <div class="settings-options">
                <label class="settings-option settings-option-theme">
                    <div class="settings-key settings-key-theme">
                        {$t('list.settings.dark')}
                    </div>
                    <div class="settings-theme-toggle">
                        <MaterialSymbol name="dark_mode" />
                        <input
                            type="checkbox"
                            name="settings-checkbox"
                            checked={$settings.theme}
                            on:change={() => $settings.theme = !$settings.theme}
                        />
                        <div class="settings-toggle settings-toggle-theme" />
                        <MaterialSymbol name="light_mode" />
                    </div>
                    <div class="settings-key settings-key-theme">
                        {$t('list.settings.light')}
                    </div>
                </label>
                {#each Object.keys($settings).slice(1) as key (key)}
                    <label class="settings-option">
                        <div class="settings-key">
                            {$t(`list.settings.${key.replaceAll('_', '-')}`)}
                        </div>
                        <input
                            type="checkbox"
                            name="settings-checkbox"
                            checked={$settings[key]}
                            on:change={() => $settings[key] = !$settings[key]}
                        />
                        <div class="settings-toggle" />
                    </label>
                {/each}
            </div>
            <div class="settings-language">
                <div class="settings-language-popup" class:hidden={languageHidden}>
                    {#each Object.keys(langs) as language (language)}
                        <button type="button" on:click={() => onLanguageChange(language)}>
                            <span style="font-family: Emoji">
                                {flags[language]}
                            </span>
                            {langs[language]}
                        </button>
                    {/each}
                </div>
                <button type="button" class="settings-language-popup-button" on:click={() => languageHidden = !languageHidden}>
                    <MaterialSymbol name="language" />
                </button>
            </div>
        </div>
    </div>

    <div class="toolbar">
        <div class="toolbar-left">
            <button type="button" on:click={() => addGroup()}>
                <MaterialSymbol name="format_list_bulleted_add" />
            </button>
            <button
                type="button"
                class="history-control"
                disabled={$todosHistory.index === 0}
                on:click={() => $todosHistory.undo()}
            >
                <MaterialSymbol name="undo" />
            </button>
            <button
                type="button"
                class="history-control"
                disabled={$todosHistory.index === $todosHistory.events.length}
                on:click={() => $todosHistory.redo()}
            >
                <MaterialSymbol name="redo" />
            </button>
        </div>
        <div class="toolbar-right">
            <button type="button" on:click={removeAll}>
                <MaterialSymbol name="delete" />
            </button>
            <button type="button" on:click={uncheckAll}>
                <MaterialSymbol name="check_box_outline_blank" />
            </button>
            <button type="button" on:click={checkAll}>
                <MaterialSymbol name="check_box" />
            </button>
            <button type="button" class="settings-button" on:click={() => settingsHidden = !settingsHidden}>
                <MaterialSymbol name="tune" />
            </button>
        </div>
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
        --settings-background: #31313163;
        --settings-language-background: #2f2f2f;
        --checkbox-background: #ffffff1a;
        --checkbox-checked: #009d9d;
        --checkbox-border: transparent;
        --checkbox-border-checked: transparent;
        --toggle-background: #414141;
        --toggle-background-checked: #8e8e8e;
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
        --settings-background: #bfe9e863;
        --settings-language-background: dbffff80;
        --checkbox-background: #0000000d;
        --checkbox-border: var(--color);
        --checkbox-border-checked: var(--checkbox-checked);
        --checkbox-checked: #009d9d;
        --toggle-background: #8c9f9f;
        --toggle-background-checked: var(--checkbox-checked);
        --radius: 4px;
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
    $settings-background: var(--settings-background);
    $settings-language-background: var(--settings-language-background);
    $checkbox-background: var(--checkbox-background);
    $checkbox-checked: var(--checkbox-checked);
    $checkbox-border: var(--checkbox-border);
    $checkbox-border-checked: var(--checkbox-border-checked);

    $toggle-transition: 0.5s background-color;
    $toggle-transition-before: 0.5s transform;
    $radius: var(--radius);
    $cube: 36px;
    $checkbox: 24px;

    button {
        cursor: pointer;
    }

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

        &.light {
            font-weight: 500;
        }
    }

    .settings {
        @include flex(endX);
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 1;
        font-size: 14px;

        &:not(.hidden) {
            .settings-overlay {
                opacity: 1;
            }

            .settings-inner {
                box-shadow: 0px 0px 20px 4px #00000080;
            }
        }

        &.hidden {
            pointer-events: none;

            .settings-inner {
                transform: translateX(100%);
            }
        }

        .settings-overlay {
            backdrop-filter: blur(2px);
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            opacity: 0;
            transition: .5s opacity;
        }

        .settings-inner {
            @include flex(column);
            backdrop-filter: blur(12px);
            background: $settings-background;
            transition: .5s transform, .5s box-shadow;
            width: 80%;
            padding: 12px;

            .settings-close {
                @include flex(center);
                align-self: flex-end;
                height: 36px;
                width: 36px;
                font-size: 24px;
            }

            .settings-options {
                @include flex(column, one);

                .settings-option {
                    @include flex(centerY, between);
                    padding: 0 8px;

                    &.settings-option-theme {
                        justify-content: center;
                    }
                    &:not(:first-of-type) {
                        margin-top: 8px;
                    }

                    &:first-of-type {
                        margin-top: 10px;
                        margin-bottom: 8px;
                    }

                    .settings-theme-toggle {
                        display: flex;
                        align-items: center;
                        margin: 0 8px;
                        font-size: 24px;

                        .settings-toggle {
                            margin: 0 8px;
                        }
                    }

                    input {
                        display: none;

                        & + .settings-toggle {
                            @include flex(centerY, noShrink);
                            width: 44px;
                            height: 24px;
                            background: var(--toggle-background);
                            border-radius: 12px;
                            position: relative;
                            cursor: pointer;
                            transition: $toggle-transition;
                            margin-left: 16px;

                            &::before {
                                position: absolute;
                                content: "";
                                height: 18px;
                                width: 18px;
                                left: 3px;
                                background-color: white;
                                transition: $toggle-transition-before;
                                border-radius: 9px;
                            }
                        }

                        &:checked + .settings-toggle {
                            background: var(--toggle-background-checked);

                            &::before {
                                transform: translateX(20px);
                            }
                        }
                    }
                }
            }

            .settings-language {
                @include flex(column, endX, endY);

                .settings-language-popup {
                    @include flex(column);
                    background: $settings-language-background;
                    padding: 6px 0;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-bottom: 12px;
                    opacity: 1;
                    transform: translateY(0);
                    transition: .3s opacity, .3s transform;

                    button {
                        padding: 4px 12px;
                        text-align: left;
                        transition: 0.5s background;

                        &:hover {
                            background: $item-background-hover;
                        }
                    }

                    &.hidden {
                        opacity: 0;
                        transform: translateY(10px);
                        pointer-events: none;
                    }
                }

                .settings-language-popup-button {
                    @include flex(center);
                    height: 36px;
                    width: 36px;
                    font-size: 28px;
                }
            }
        }
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
            @include flex;

            button {
                @include flex(center);
                width: 26px;
                height: 26px;
                font-size: 26px;

                &:not(:first-of-type) {
                    margin-left: 8px;
                }
            }
        }

        .history-control {
            // font-size: 20px;

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
            font-size: 24px;

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
        margin-bottom: 4px;

        &:hover,
        &:active {
            background: $item-background-hover;
        }

        &.checked {
            // order: 1;
            filter: opacity(0.5);
        }

        .list-drag {
            @include flex(center, noShrink);
            width: $cube;
            height: $cube;
            font-size: $checkbox;
        }

        .list-label {
            @include flex(centerY, one);

            input[type="checkbox"] {
                display: none;

                & + .list-checkbox {
                    @include flex(center, noShrink);
                    width: $checkbox;
                    height: $checkbox;
                    font-size: $checkbox;
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
            font-size: $checkbox;
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
            font-size: $checkbox;
            margin-right: 8px;
        }

        .list-plus-text {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
</style>
