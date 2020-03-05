import { IRbacValidator } from '../interfaces/rbac-validator.interface';
import { IRbacAccount } from '../interfaces/rbac-account.interface';
import { Store } from '../store';
import { IRbacOptions } from '../interfaces/rbac-options.interface';
import { parse } from '../parser';
import { IRbacData } from '../interfaces/rbac-data.interface';
import { Injectable } from "@nestjs/common";

@Injectable()
export class ConsulValidator implements IRbacValidator {
    private readonly store: Store = new Store();
    private consul: any;

    public validate(resource: string, verb: string, account: IRbacAccount): boolean {
        return this.store.validate(account.name, resource, verb);
    }

    public getData(): IRbacData {
        return this.store.getData();
    }

    public async init(config: IRbacOptions, client?: any) {
        this.consul = client;
        const name = config.parameters.name;
        if (name) {
            await this.watch(name);
        }
    }

    private async watch(name: string) {
        const data = await this.consul.kv.get(name);
        if (data && data.Value) {
            const { accounts, roles, roleBindings } = parse(data.Value);
            this.store.init(accounts, roles, roleBindings);
        }

        const watcher = this.consul.watch({
            method: this.consul.kv.get,
            options: { name, timeout: 5 * 60 * 1000 },
        });
        watcher.on('change', data => {
            if (data && data.Value) {
                const { accounts, roles, roleBindings } = parse(data.Value);
                this.store.init(accounts, roles, roleBindings);
            }
        });
        watcher.on('error', e => void 0);
    }
}
