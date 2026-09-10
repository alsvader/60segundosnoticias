import * as migration_20260909_165240_initial_schema from './20260909_165240_initial_schema';
import * as migration_20260909_220506_add_media_uploaded_by from './20260909_220506_add_media_uploaded_by';
import * as migration_20260910_071432_home_global from './20260910_071432_home_global';
import * as migration_20260910_165003_editorial_intro from './20260910_165003_editorial_intro';
import * as migration_20260910_174956_cta_link_fields_add from './20260910_174956_cta_link_fields_add';
import * as migration_20260910_175033_cta_link_fields_remove_old from './20260910_175033_cta_link_fields_remove_old';

export const migrations = [
  {
    up: migration_20260909_165240_initial_schema.up,
    down: migration_20260909_165240_initial_schema.down,
    name: '20260909_165240_initial_schema',
  },
  {
    up: migration_20260909_220506_add_media_uploaded_by.up,
    down: migration_20260909_220506_add_media_uploaded_by.down,
    name: '20260909_220506_add_media_uploaded_by',
  },
  {
    up: migration_20260910_071432_home_global.up,
    down: migration_20260910_071432_home_global.down,
    name: '20260910_071432_home_global',
  },
  {
    up: migration_20260910_165003_editorial_intro.up,
    down: migration_20260910_165003_editorial_intro.down,
    name: '20260910_165003_editorial_intro',
  },
  {
    up: migration_20260910_174956_cta_link_fields_add.up,
    down: migration_20260910_174956_cta_link_fields_add.down,
    name: '20260910_174956_cta_link_fields_add',
  },
  {
    up: migration_20260910_175033_cta_link_fields_remove_old.up,
    down: migration_20260910_175033_cta_link_fields_remove_old.down,
    name: '20260910_175033_cta_link_fields_remove_old'
  },
];
