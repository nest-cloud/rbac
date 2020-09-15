import { IRbacValidator } from '../interfaces/rbac-validator.interface';
import { IRbacAccount } from '../interfaces/rbac-account.interface';
import { parse } from '../parser';
import { Store } from '../store';
import { IRbacOptions } from '../interfaces/rbac-options.interface';
import { IEtcd } from '@nestcloud/common';
import * as RPC from 'etcd3/lib/src/rpc';
import { IRbacData } from '../interfaces/rbac-data.interface';
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EtcdValidator implements IRbacValidator {
    private readonly logger = new Logger(EtcdValidator.name);
    private readonly store: Store = new Store();
    private client: IEtcd;

    public validate(resource: string, verb: string, account: IRbacAccount): boolean {
        return this.store.validate(account.name, resource, verb);
    }

    public getData(): IRbacData {
        return this.store.getData();
    }

    public async init(options: IRbacOptions, client?: IEtcd) {
        this.client = client;
        const name = options.parameters.name;
        const namespace = options.parameters.namespace;
        if (name) {
            await this.watch(name, namespace);
        }
    }

    private async watch(name: string, namespace: string) {
        try {
            const data = await this.client.namespace(namespace).get(name).string();
            if (data) {
                const { accounts, roles, roleBindings } = parse(data);
                this.store.init(accounts, roles, roleBindings);
            }
        } catch (e) {
            this.logger.error('Init rbac data error', e);
        }


        const watcher = await this.client.namespace(namespace).watch().key(name).create();
        watcher.on('data', (res: RPC.IWatchResponse) => {
            const event = res.events.filter(evt => !evt.prev_kv)[0];
            if (event) {
                if (event.type === 'Delete') {
                    this.store.reset();
                } else if (event.type === 'Put') {
                    if (event.kv.value && event.kv.value.toString()) {
                        const { accounts, roles, roleBindings } = parse(event.kv.value.toString());
                        this.store.init(accounts, roles, roleBindings);
                    }
                }
            }
        });
        watcher.on('connected', async () => {
            try {
                const data = await this.client.namespace(namespace).get(name).string();
                if (data) {
                    const { accounts, roles, roleBindings } = parse(data);
                    this.store.init(accounts, roles, roleBindings);
                }
            } catch (e) {
                this.logger.error('Init rbac data error', e);
            }
        });
    }
}
