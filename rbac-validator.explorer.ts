import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { RbacValidatorRegistry } from "./rbac-validator.registry";
import { RbacMetadataAccessor } from "./rbac-metadata.accesser";
import { Scanner } from "./scanner";
import { IRbacValidator } from "./interfaces/rbac-validator.interface";

@Injectable()
export class RbacValidatorExplorer implements OnModuleInit {
    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataAccessor: RbacMetadataAccessor,
        private readonly validatorRegistry: RbacValidatorRegistry,
        private readonly scanner: Scanner,
    ) {
    }

    onModuleInit() {
        this.explore();
    }

    explore() {
        const providers: InstanceWrapper[] = [
            ...this.discoveryService.getProviders(),
            ...this.discoveryService.getControllers(),
        ];
        providers.forEach((wrapper: InstanceWrapper) => {
            const { instance } = wrapper;
            if (!instance) {
                return;
            }
            this.lookupValidators(instance);
        });
    }

    lookupValidators(instance: Function) {
        const Validators = this.metadataAccessor.getValidators(instance.constructor);
        if (Validators) {
            Validators.forEach(ref => {
                const validator = this.scanner.findInjectable<IRbacValidator>(ref as Function);
                if (validator) {
                    this.validatorRegistry.setValidator(validator);
                }
            });
        }
    }
}
