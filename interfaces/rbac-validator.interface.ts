import { IRbacAccount } from './rbac-account.interface';
import { IRbacOptions } from './rbac-options.interface';
import { IRbacData } from './rbac-data.interface';

export interface IRbacValidator {
    init(options: IRbacOptions, client?: any): void;

    validate(resource: string, verb: string, account: IRbacAccount): boolean | Promise<boolean>;

    getData?(options?: any): IRbacData | Promise<IRbacData>;
}
