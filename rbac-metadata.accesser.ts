import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VALIDATOR_METADATA } from "./rbac.constants";

@Injectable()
export class RbacMetadataAccessor {
    constructor(
        private readonly reflector: Reflector,
    ) {
    }

    getValidators(target: Function): Function[] | undefined {
        return this.reflector.get(VALIDATOR_METADATA, target);
    }
}
