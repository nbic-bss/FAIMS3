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
 * Filename: src/datamodel/users.ts
 * Description:
 *   Data models related to users.
 */

import {Role} from '../../permission';

export type V1InviteDBFields = {
  // The project it refers to
  project_id: string;
  // Role (as untyped string - could be admin, team, user etc)
  role: string;
};

export type V2InviteDBFields = {
  // The project it refers to
  projectId: string;
  // Role (enum)
  role: Role;
};

export type InvitesDBFields = V2InviteDBFields;
export type ExistingInvitesDBDocument =
  PouchDB.Core.ExistingDocument<InvitesDBFields>;
export type NewInvitesDBDocument = PouchDB.Core.Document<InvitesDBFields>;
export type InvitesDB = PouchDB.Database<InvitesDBFields>;
