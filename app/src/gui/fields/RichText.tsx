/*
 * Copyright 2021 Macquarie University
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
 /*
 * RichTextField Component
 *
 * This component renders a rich text field using Markdown.
 * - Markdown-formatted content displayed as HTML.
 *
 * Props:
 * - content (string): Markdown content to be rendered.
 */
import React from 'react';
import MarkdownIt from 'markdown-it';

/**
 * Props for the RichTextField component.
 */
interface Props {
  content: string;
}

/**
 * RichTextField Component - Reusable Markdown renderer witth Formik integration.
 */
export const RichTextField: React.FC<Props> = ({content}) => {
  const md = new MarkdownIt();
  const renderedContent = md.render(content);

  return <div dangerouslySetInnerHTML={{__html: renderedContent}} />;
};
// const uiSpec = {
//   'component-namespace': 'faims-custom',
//   'component-name': 'RichText',
//   'type-returned': 'faims-core::String',
//   'component-parameters': {
//     label: 'Unused',
//     content: '',
//   },
// };
