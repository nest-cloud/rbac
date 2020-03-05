import { SetMetadata } from '@nestjs/common';
import { RESOURCE_METADATA } from '../rbac.constants';

export const Resource = (resource: string) => SetMetadata(RESOURCE_METADATA, resource);
