import { SetMetadata } from '@nestjs/common';
import { VERB_METADATA } from '../rbac.constants';

export const Verb = (verb: string) => SetMetadata(VERB_METADATA, verb);
