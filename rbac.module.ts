import { Module, DynamicModule, Global } from '@nestjs/common';
import { BOOT, CONFIG, CONSUL, ETCD, IBoot, IConfig, IEtcd } from '@nestcloud/common';
import { Rbac } from './rbac';
import { IRbacOptions } from './interfaces/rbac-options.interface';
import { DiscoveryModule } from "@nestjs/core";
import { Scanner } from "./scanner";
import { RbacMetadataAccessor } from "./rbac-metadata.accesser";
import { RbacValidatorRegistry } from "./rbac-validator.registry";
import { RbacValidatorExplorer } from "./rbac-validator.explorer";
import { RBAC } from "./rbac.constants";

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [Scanner, RbacMetadataAccessor],
})
export class RbacModule {
    static forRoot(options: IRbacOptions): DynamicModule {
        return this.forRootAsync(options);
    }

    static forRootAsync(options: IRbacOptions): DynamicModule {
        const inject = [RbacValidatorRegistry, ...options.inject];
        const rbacProvider = {
            provide: RBAC,
            useFactory: async (registry: RbacValidatorRegistry, ...args: any[]): Promise<Rbac> => {
                const boot: IBoot = args[inject.indexOf(BOOT) - 1];
                const config: IConfig = args[inject.indexOf(CONFIG) - 1];
                if (boot) {
                    options.parameters = boot.get<{ [key: string]: string }>('rbac.parameters', options.parameters);
                }
                if (config) {
                    options.parameters = config.get<{ [key: string]: string }>('rbac.parameters', options.parameters);
                }
                options.parameters = options.parameters || {};

                const consul = args[inject.indexOf(CONSUL) - 1];
                const etcd: IEtcd = args[inject.indexOf(ETCD) - 1];

                const rbac = new Rbac(options, registry);
                if (consul) {
                    await rbac.init(consul);
                } else if (etcd) {
                    await rbac.init(etcd);
                } else {
                    await rbac.init();
                }

                return rbac;
            },
            inject,
        };

        return {
            module: RbacModule,
            providers: [rbacProvider, RbacValidatorRegistry, RbacValidatorExplorer],
            exports: [rbacProvider],
        };
    }
}
