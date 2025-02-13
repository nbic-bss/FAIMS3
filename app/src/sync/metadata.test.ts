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
 * Filename: metadata.test.ts
 * Description:
 *   Tests for getting/setting metadata
 */

import {expect, test} from 'vitest';
import {fetchProjectMetadata, getMetadataValue, PropertyMap} from './metadata';

import {afterAll, afterEach, beforeAll} from 'vitest';
import {setupServer} from 'msw/node';
import {HttpResponse, http} from 'msw';
import {getMetadataDbForProject} from '.';

const project_id = 'sample-notebook';
const conductor_url = 'http://conductor';

const notebook = {
  metadata: {
    name: 'Test Notebook',
    project_lead: 'A. N. Other',
  },
  'ui-specification': {
    fields: {},
    fviews: {},
    viewsets: {},
    visible_types: [],
  },
};

const restHandlers = [
  http.get(`${conductor_url}/api/notebooks/${project_id}`, () => {
    return HttpResponse.json(notebook);
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen());

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

test('fetch project metadata', async () => {
  const lst = {
    listing: {
      conductor_url: conductor_url,
      id: 'test',
      name: 'test',
      description: 'test',
    },
  };
  const full_project_id = 'test||' + project_id;

  await fetchProjectMetadata(lst, project_id);

  const db = await getMetadataDbForProject(full_project_id);
  try {
    const metaDoc = (await db.get('metadata')) as PropertyMap;
    expect(metaDoc.name).toBe(notebook.metadata.name);
  } catch {
    console.log('error getting test data');
  }
  const name = await getMetadataValue(full_project_id, 'name');
  expect(name).toBe(notebook.metadata.name);
});
