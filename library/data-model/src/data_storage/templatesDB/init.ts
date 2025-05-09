import {InitialisationContent} from '../utils';
import {templatesDbDesignDocuments} from './design';
import {TemplatesDBSecurityDocument} from './security';

export type TemplatesDBInitialisationConfig = {};
export function initTemplatesDB(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config: TemplatesDBInitialisationConfig
): InitialisationContent {
  return {
    designDocuments: [templatesDbDesignDocuments.indexDocument],
    securityDocument: TemplatesDBSecurityDocument,
  };
}
