import { Inject } from '@nestjs/common';
import { RBAC } from '../rbac.constants';

export const InjectRbac = () => Inject(RBAC);
