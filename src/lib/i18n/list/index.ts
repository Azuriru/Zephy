export default [
    {
        locale: 'en',
        key: 'list',
        loader: async () => (await import('./en.json')).default
    },
    {
        locale: 'id',
        key: 'list',
        loader: async () => (await import('./id.json')).default
    },
    {
        locale: 'tl',
        key: 'list',
        loader: async () => (await import('./tl.json')).default
    },
    {
        locale: 'ru',
        key: 'list',
        loader: async () => (await import('./ru.json')).default
    },
    {
        locale: 'tr',
        key: 'list',
        loader: async () => (await import('./tr.json')).default
    },
    {
        locale: 'zh',
        key: 'list',
        loader: async () => (await import('./zh.json')).default
    },
    {
        locale: 'zh-tw',
        key: 'list',
        loader: async () => (await import('./zh-tw.json')).default
    }
];