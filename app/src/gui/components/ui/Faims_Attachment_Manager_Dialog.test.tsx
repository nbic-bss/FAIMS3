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
 * Filename: Dialog.test.tsx
 */

import {render, screen} from '@testing-library/react';
import FaimsAttachmentManagerDialog from './Faims_Attachment_Manager_Dialog';
import {expect, vi, describe, it} from 'vitest';

const testData = {
  open: true,
  project_id: 'test-dialog-id',
  setopen: vi.fn(() => {}),
  filedId: 'test',
  isSyncing: 'true',
  serverId: 'todo',
};

describe('Check dialog component', () => {
  it('Check with path', () => {
    render(<FaimsAttachmentManagerDialog {...testData} path={'test-path'} />);

    expect(screen.getByTestId('dialog-img')).toBeTruthy();
  });
});
