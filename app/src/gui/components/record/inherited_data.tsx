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
 * Filename: inherited_data.tsx
 * Description:
 *   TODO
 */

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {Box, Typography} from '@mui/material';
import CircularLoading from '../ui/circular_loading';
import {Accordion, AccordionDetails, AccordionSummary} from './accordion';
import ParentForm, {ParentFormProps} from './relationships/parent_form';

export default function InheritedDataComponent(props: ParentFormProps) {
  const {parentRecords, ui_specification} = props;

  return (
    <Accordion>
      <AccordionSummary
        aria-controls="links-accordion-content"
        id="links-accordion"
      >
        <ContentCopyIcon sx={{mr: 1}} />
        <Typography>Inherited Data</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{p: 2}}>
          {parentRecords === null && (
            <CircularLoading label={'Loading data inherited from parent'} />
          )}
          <ParentForm
            parentRecords={parentRecords}
            ui_specification={ui_specification}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
