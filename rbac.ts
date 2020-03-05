import { IRbacOptions } from './interfaces/rbac-options.interface';
import { IRbacValidator } from './interfaces/rbac-validator.interface';
import { RbacValidatorRegistry } from "./rbac-validator.registry";

export class Rbac {
    private validator: IRbacValidator;

    constructor(
        private readonly options: IRbacOptions,
        private readonly registry: RbacValidatorRegistry,
    ) {
    }

    public async init(client?: any) {
        this.validator = this.registry.getValidator();
        if (this.validator) {
            await this.validator.init(this.options, client);
            return;
        }
        this.registry.watch(async validator => {
            this.validator = validator;
            await this.validator.init(this.options, client);
        });
    }

    public getValidator(): IRbacValidator {
        return this.validator;
    }
}
