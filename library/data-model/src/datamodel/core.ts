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
 * Filename: core.ts
 * Description:
 *   Core types/interfaces that are used throughout the codebase.
 *   Types/interfaces that are only used within the GUI, or are what the GUI
 *   sees should go in the gui file, whilst those types only used within the
 *   databases should go in the database file.
 */

import {
  CouchProjectUIModel,
  EncodedProjectUIModel,
  FullyResolvedRecordID,
  ProjectUIModel,
  SplitRecordID,
} from '../types';

export const HRID_STRING = 'hrid';

export const DEFAULT_RELATION_LINK_VOCABULARY = 'is related to';

/**
 * Generate a {FullyResolvedRecordID} from a {SplitRecordID}
 * @param {SplitRecordID} split_id the Split record identifier
 * @returns {FullyResolvedRecordID}
 */
export function resolve_record_id(
  split_id: SplitRecordID
): FullyResolvedRecordID {
  const cleaned_project_id = split_id.project_id.replace('||', '\\|\\|');
  return cleaned_project_id + '||' + split_id.record_id;
}

export function split_full_record_id(
  full_record_id: FullyResolvedRecordID
): SplitRecordID {
  const splitId = full_record_id.split('||');
  if (
    splitId.length !== 2 ||
    splitId[0].trim() === '' ||
    splitId[1].trim() === ''
  ) {
    throw Error('Not a valid full record id');
  }
  const cleaned_project_id = splitId[0].replace('\\|\\|', '||');
  return {
    project_id: cleaned_project_id,
    record_id: splitId[1],
  };
}

/**
 * converts the encoded UI spec representation into the normal one
 * @param rawUiSpec The raw encoded spec
 * @returns Normal functional spec
 */
export const decodeUiSpec = (
  rawUiSpec: EncodedProjectUIModel
): ProjectUIModel => {
  return {
    fields: rawUiSpec.fields,
    views: rawUiSpec.fviews,
    viewsets: rawUiSpec.viewsets,
    visible_types: rawUiSpec.visible_types,
  };
};

/**
 * converts the encoded UI spec representation into the normal one
 * @param rawUiSpec The raw encoded spec
 * @returns Normal functional spec
 */
export const decodeCouchUiSpec = (
  rawUiSpec: CouchProjectUIModel
): ProjectUIModel => {
  const {_id, _rev, ...spec} = rawUiSpec;
  return {
    _id,
    _rev,
    ...decodeUiSpec(spec),
  };
};
