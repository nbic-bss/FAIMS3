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
 * Filename: setupTests.ts
 * Description:
 *   TODO
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
//import '@testing-library/jest-dom';
//jest.setTimeout(15000); // in milliseconds

import PouchDB from 'pouchdb-browser';
import PouchDBAdaptorMemory from 'pouchdb-adapter-memory';
import {ProjectID} from '@faims3/data-model';
import {vi} from 'vitest';
PouchDB.plugin(PouchDBAdaptorMemory);

const projdbs: any = {};

async function mockProjectDB(project_id: ProjectID) {
  if (projdbs[project_id] === undefined) {
    const db = new PouchDB(project_id, {adapter: 'memory'});
    projdbs[project_id] = db;
  }
  return projdbs[project_id];
}

vi.mock('./sync/index', () => ({
  getProjectDB: mockProjectDB,
}));

async function mockGetTokenForCluster(listing_id: string) {
  return 'token-' + listing_id;
}

vi.mock('./users', () => ({
  getTokenForCluster: mockGetTokenForCluster,
  shouldDisplayRecord: () => true,
}));
