/*
 * Copyright 2021, 2022 Macquarie University
 *
 * Licensed under the Apache License Version 2.0 (the, "License");
 * you may not use, this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
 * See, the License, for the specific language governing permissions and
 * limitations under the License.
 *
 * Filename: databases.ts
 * Description:
 *   Create the main local databases and provide access to them
 */

import {
  ListingID,
  NonUniqueProjectID,
  ProjectDataObject,
  ProjectID,
  ProjectMetaObject,
} from '@faims3/data-model';
import {ListingsObject} from '@faims3/data-model/src/types';
import PouchDB from 'pouchdb-browser';
import {POUCH_BATCH_SIZE, POUCH_BATCHES_LIMIT} from '../buildconfig';
import {db as projects_db} from '../dbs/projects-db';
import {logError} from '../logging';
import {
  ConnectionInfo,
  ConnectionInfo_create_pouch,
  local_pouch_options,
} from './connection';
import {draft_db} from './draft-storage';
import {ProjectObject} from './projects';

export const DB_TIMEOUT = 2000;
export const DEFAULT_LISTING_ID = 'default';
export const POUCH_SEPARATOR = '_';

export type ExistingActiveDoc = PouchDB.Core.ExistingDocument<ActiveDoc>;
export type ExistingListings = PouchDB.Core.ExistingDocument<ListingsObject>;

export interface LocalDB<Content extends {}> {
  local: PouchDB.Database<Content>;
  changes: PouchDB.Core.Changes<Content>;
  is_sync: boolean;
  is_sync_attachments: boolean;
  remote: null | LocalDBRemote<Content>;
}

export interface LocalDBRemote<Content extends {}> {
  db: PouchDB.Database<Content>;
  connection:
    | PouchDB.Replication.Replication<Content>
    | PouchDB.Replication.Sync<Content>
    | null;
  info: ConnectionInfo;
  options: DBReplicateOptions;
}

export interface LocalDBList<Content extends {}> {
  [key: string]: LocalDB<Content>;
}

type DBReplicateOptions =
  | PouchDB.Replication.ReplicateOptions
  | {
      pull: PouchDB.Replication.ReplicateOptions;
      push: PouchDB.Replication.ReplicateOptions;
    };

/**
 * Each database has a changes stream.
 * This is the template for which the changes stream is listened to
 * Some databases might use options added to this like:
 *  {...default_changes_opts, filter:'abc'}
 * If they want to, for example, restrict to only listings in the active DB.
 */
export const default_changes_opts: PouchDB.Core.ChangesOptions &
  PouchDB.Core.AllDocsOptions = {
  live: true,
  since: 'now',
  timeout: DB_TIMEOUT,
  include_docs: true,
  conflicts: true,
  attachments: true,
};

export const directory_db_pouch = new PouchDB<ListingsObject>(
  'directory',
  local_pouch_options
);
/**
 * Directory: All (public) Faims instances
 */
export const directory_db: LocalDB<ListingsObject> = {
  local: directory_db_pouch,
  changes: directory_db_pouch.changes({...default_changes_opts, since: 'now'}),
  remote: null,
  is_sync: true,
  is_sync_attachments: false,
};

/**
 * Active: A local (NOT synced) list of:
 *   {_id, username, password, project_id, listing_id}
 *   For each project the current device is part of (so this is keyed by listing id + project id),
 *   * listing_id: A couchdb instance object's id (from "directory" db)
 *   * project_id: A project id (from the project_db in the couchdb instance object.)
 *   * authentication mechanism used (id of a doc in the auth_db)
 */
export interface ActiveDoc {
  _id: ProjectID;
  listing_id: ListingID;
  project_id: NonUniqueProjectID;
  username: string | null;
  password: string | null;
  friendly_name?: string;
  is_sync: boolean;
  is_sync_attachments: boolean;
}

export const active_db = new PouchDB<ActiveDoc>('active', local_pouch_options);

/**
 * This contains any local app state we want to keep across sessions
 */
const local_state_db = new PouchDB('local_state', local_pouch_options);

export const getLocalStateDB = () => {
  return local_state_db;
};

/**
 * Each listing has a Projects database and Users DBs
 */
export const projects_dbs: LocalDBList<ProjectObject> = {};

/**
 * Per-[active]-project project data:
 * Contain in these databases (indexed by the active_db id's)
 * is project data.
 */
export const data_dbs: LocalDBList<ProjectDataObject> = {};

/**
 * Synced from the project meta-database for each active project,
 * This has the metadata describing a database. Project Schemas,
 * GUI Models, and a People database.
 */
export const metadata_dbs: LocalDBList<ProjectMetaObject> = {};

/**
 * @param prefix Name to use to run new PouchDB(prefix + POUCH_SEPARATOR + id), objects of the same type have the same prefix
 * @param local_db_id id is per-object of type, to discriminate between them. i.e. a project ID
 * @param global_dbs projects_db
 * @returns Flag if newly created =true, already existing=false & The local DB
 */
export function ensure_local_db<Content extends {}>(
  prefix: string,
  local_db_id: string,
  start_sync: boolean,
  global_dbs: LocalDBList<Content>,
  start_sync_attachments: boolean
): [boolean, LocalDB<Content>] {
  if (global_dbs[local_db_id]) {
    global_dbs[local_db_id].is_sync = start_sync;
    return [false, global_dbs[local_db_id]];
  } else {
    const db = new PouchDB<Content>(
      prefix + POUCH_SEPARATOR + local_db_id,
      local_pouch_options
    );
    return [
      true,
      (global_dbs[local_db_id] = {
        local: db,
        changes: db.changes(default_changes_opts),
        is_sync: start_sync,
        is_sync_attachments: start_sync_attachments,
        remote: null,
      }),
    ];
  }
}

/**
 * @param local_db_id id is per-object of type, to discriminate between them. i.e. a project ID
 * @param global_dbs projects_db
 * @param connection_info Info to use to connect to remote
 * @param options PouchDB options. Defaults to live: true, retry: true.
 *                if options.sync is defined, then this turns into ensuring the DB
 *                is pushing to the remote as well as pulling.
 * @returns Flag if newly created =true, already existing=false & The local DB & remote
 */
export function ensure_synced_db<Content extends {}>(
  local_db_id: string,
  connection_info: ConnectionInfo | null,
  global_dbs: LocalDBList<Content>,
  options: DBReplicateOptions = {}
): [boolean, LocalDB<Content>] {
  if (global_dbs[local_db_id] === undefined) {
    throw 'Logic error: ensure_local_db must be called before this code';
  }

  // Already connected/connecting, or local-only database

  // This checks for a diff so as to not unnecessarily recreate synced
  // connections without any changes
  if (
    global_dbs[local_db_id].remote !== null &&
    JSON.stringify(global_dbs[local_db_id].remote!.info) ===
      JSON.stringify(connection_info) &&
    JSON.stringify(global_dbs[local_db_id].remote!.options) ===
      JSON.stringify(options)
  ) {
    return [
      false,
      {
        ...global_dbs[local_db_id],
        remote: global_dbs[local_db_id].remote!,
      },
    ];
  }

  // Special case for local-only projects
  if (connection_info === null) {
    return [false, global_dbs[local_db_id]];
  }

  const db_info = (global_dbs[local_db_id] = {
    ...global_dbs[local_db_id],
    remote: {
      db: ConnectionInfo_create_pouch(connection_info),
      connection: null, //Connection initialized in setLocalConnection
      info: connection_info,
      options: options,
    },
  });

  setLocalConnection(db_info);
  return [true, db_info];
}

/**
 * If the given remote DB is not synced, starts syncing, and visa versa.
 * db_info.remote.{connection, handler} are modified based on what's in
 * db_info.is_sync, db_info.remote.info, db_info.remote.create_handler.
 *
 * This does NOT ensure that the existing connection info (URL, port, proto)
 * matches anything. that's left to ensure_synced_db
 *
 * @param db_info info to use to create a DB connection:
 *                Remote connection info, is_sync, the local DB to sync with,
 */
export function setLocalConnection<Content extends {}>(
  db_info: LocalDB<Content> & {remote: LocalDBRemote<Content>}
) {
  const options = db_info.remote.options;

  if (db_info.is_sync) {
    if (db_info.remote.connection !== null) {
      // Stop an existing connection
      db_info.remote.connection.cancel();
      db_info.remote.connection = null;
      console.debug('Removed sync for', db_info);
    }
    // Start a new connection
    const push_too = (options as {push?: unknown}).push !== undefined;
    let connection:
      | PouchDB.Replication.Replication<Content>
      | PouchDB.Replication.Sync<Content>;

    const pull_filter = db_info.is_sync_attachments
      ? {}
      : {filter: '_view', view: 'attachment_filter/attachment_filter'};

    if (push_too) {
      const options_sync = options as PouchDB.Replication.SyncOptions;
      console.debug(
        'Pushing and pulling from',
        db_info,
        options_sync.push,
        options_sync.pull,
        pull_filter
      );
      connection = PouchDB.sync(db_info.local, db_info.remote.db, {
        push: {
          live: true,
          retry: true,
          checkpoint: 'source',
          batch_size: POUCH_BATCH_SIZE,
          batches_limit: POUCH_BATCHES_LIMIT,
          ...options_sync.push,
        },
        pull: {
          live: true,
          retry: true,
          checkpoint: 'target',
          batch_size: POUCH_BATCH_SIZE,
          batches_limit: POUCH_BATCHES_LIMIT,
          ...pull_filter,
          ...(options_sync.pull || {}),
        },
      });
    } else {
      console.debug('Pulling only from', db_info, options);
      connection = PouchDB.replicate(db_info.remote.db, db_info.local, {
        live: true,
        retry: true,
        checkpoint: 'target',
        ...options,
      });
    }

    db_info.remote.connection = connection;
    console.debug('Added sync for', db_info);
  } else if (!db_info.is_sync && db_info.remote.connection !== null) {
    // Stop an existing connection
    db_info.remote.connection.cancel();
    db_info.remote.connection = null;
    console.debug('Removed sync for', db_info);
  } else {
    logError(`Sync is still off ${db_info}`);
  }
}

async function delete_synced_db(name: string, db: LocalDB<any>) {
  try {
    console.debug(await db.remote?.db.close());
  } catch (err) {
    logError(err);
  }
  try {
    console.debug(await db.local.destroy());
    console.debug('Removed local db', name);
  } catch (err) {
    logError(err);
  }
}

async function delete_synced_dbs(db_list: LocalDBList<any>) {
  for (const name in db_list) {
    console.debug('Deleting', name);
    await delete_synced_db(name, db_list[name]);
    delete db_list['name'];
  }
}

export async function wipe_all_pouch_databases() {
  const local_only_dbs_to_wipe = [
    active_db,
    local_state_db,
    draft_db,
    projects_db,
  ];
  await delete_synced_dbs(data_dbs);
  await delete_synced_dbs(metadata_dbs);
  await delete_synced_dbs(projects_dbs);
  await delete_synced_db('directory', directory_db);
  for (const db of local_only_dbs_to_wipe) {
    try {
      console.debug(await db.destroy());
    } catch (err) {
      logError(err);
    }
  }
  // TODO: work out how best to recreate the databases, currently using a
  // redirect and having FAIMS reinitialise seems to be the best
  console.debug('Deleted dbs');
}

/**
 * Sets the remote sync connection jwt_token property for all activated projects
 * data DBs to a new token as specified.
 *
 * NOTE uses the ensure_synced_db method which will check for a diff in the
 * connection info, prompting recreation of the remote db
 *
 * TODO this could be more specific to the username + listing combination once
 * the data dbs are tracked to logged in users that activated them
 *
 * @param serverId Listing/server to target for a token refresh
 * @param newToken The new token to set as the connection info for the remote db
 * sync
 */
export async function refreshDataDbTokens({
  serverId,
  newToken,
}: {
  serverId: string;
  newToken: string;
}) {
  const activeRecords = (await active_db.allDocs({include_docs: true})).rows
    .map(d => d.doc)
    .filter(d => !!d);

  for (const record of activeRecords) {
    // This is server/project combinations
    const {listing_id} = record;

    if (listing_id !== serverId) {
      continue;
    }

    const dbKey = record._id;

    // Get the associated data DB for this active db
    const db = data_dbs[dbKey];

    if (!db.remote) {
      continue;
    }

    // Take existing remote DB connection info, replace token with new token
    const newConnectionInfo: ConnectionInfo = {
      ...db.remote?.info,
      jwt_token: newToken,
    };

    // run the synced db operation which will update the
    ensure_synced_db(dbKey, newConnectionInfo, data_dbs);
  }
}
