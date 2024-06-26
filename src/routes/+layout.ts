import { Load } from '@sveltejs/kit';
import { defaultLocale, loadTranslations, locale } from '$lib/i18n';
import { persistible } from '$lib/util/store';
import { get } from 'svelte/store';

export const load: Load = async ({ url }) => {
    const language = persistible('language', defaultLocale);
    const initLocale = locale.get() || get(language);

    await loadTranslations(initLocale, url.pathname);

    return {};
};