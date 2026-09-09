import * as migration_20260909_165240_initial_schema from './20260909_165240_initial_schema';
import * as migration_20260909_220506_add_media_uploaded_by from './20260909_220506_add_media_uploaded_by';

export const migrations = [
  {
    up: migration_20260909_165240_initial_schema.up,
    down: migration_20260909_165240_initial_schema.down,
    name: '20260909_165240_initial_schema',
  },
  {
    up: migration_20260909_220506_add_media_uploaded_by.up,
    down: migration_20260909_220506_add_media_uploaded_by.down,
    name: '20260909_220506_add_media_uploaded_by'
  },
];
