export default [
    {
        locale: 'en',
        key: 'list',
        loader: async () => (await import('./en.json')).default
    },
    {
        locale: 'zh',
        key: 'list',
        loader: async () => (await import('./zh.json')).default
    }
];