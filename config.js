const SITE_CONFIG = {
    categories: [
        { key: 'mods', files: MODS_FILES },
        { key: 'game', files: GAME_FILES },
        { key: 'litematic', files: LITEMATIC_FILES },
        { key: 'resourcepacks', files: RESOURCEPACKS_FILES }
    ],
    get files() {
        return this.categories.flatMap(cat =>
            cat.files.map(f => ({ ...f, category: cat.key }))
        );
    }
};
