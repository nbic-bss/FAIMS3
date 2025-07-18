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
 * Filename: notebook.test.tsx
 * Description:
 *   TODO
 */

import {TestWrapper} from '../fields/utils';
import {act, cleanup, render, screen} from '@testing-library/react';
import Notebook from './notebook';
import {expect, vi, afterEach, it, describe} from 'vitest';

afterEach(() => {
  cleanup();
});

const testProjectInfo = {
  created: 'Unknown',
  description: 'No description',
  is_activated: true,
  last_updated: 'Unknown',
  listing_id: 'default',
  name: 'Test Name',
  project_id: 'test-project',
  status: 'published',
  metadata: {name: 'Test Name'},
};

vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) satisfies Object;
  return {
    ...actual,
    useParams: () => ({
      projectId: testProjectInfo.project_id,
      serverId: 'test-server',
    }),
    useNavigate: vi.fn(() => {}),
    Link: vi.fn(() => {}),
    RouterLink: vi.fn(() => {}),
    NavLink: vi.fn(() => {}),
  };
});

describe('Check notebook page', () => {
  it('Check with project id', async () => {
    act(() => {
      render(
        <TestWrapper>
          <Notebook />
        </TestWrapper>
      );
    });

    // expect(screen.getByTestId('progressbar')).toBeTruthy();

    // await waitForElementToBeRemoved(() => screen.getByTestId('progressbar'));

    expect(screen.getAllByText(testProjectInfo.name)).toBeTruthy();

    //expect(useNavigate).toBeCalledTimes(1);
  });
});
