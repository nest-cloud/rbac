import { Injectable } from '@nestjs/common';
import { IRbacValidator } from "./interfaces/rbac-validator.interface";

@Injectable()
export class RbacValidatorRegistry {
    private readonly store = { validator: null };

    public setValidator(validator: IRbacValidator) {
        this.store.validator = validator;
    }

    public getValidator(): IRbacValidator | undefined {
        return this.store.validator;
    }

    public watch(callback: (IRbacValidator) => void) {
        Object.defineProperty(this.store, 'validator', {
            set: newVal => {
                callback(newVal);
            },
        });
    }
}
