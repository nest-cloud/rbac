import { get } from 'lodash';
import { IRbacValidator } from '../interfaces/rbac-validator.interface';
import { IRbacAccount } from '../interfaces/rbac-account.interface';
import { parse } from '../parser';
import { Store } from '../store';
import { IRbacOptions } from '../interfaces/rbac-options.interface';
import { IKubernetes } from '@nestcloud/common';
import { IRbacData } from '../interfaces/rbac-data.interface';

export class KubeValidator implements IRbacValidator {
    private readonly store: Store = new Store();
    private client: IKubernetes;

    public validate(resource: string, verb: string, account: IRbacAccount): boolean {
        return this.store.validate(account.name, resource, verb);
    }

    public getData(): IRbacData {
        return this.store.getData();
    }

    public async init(options: IRbacOptions, client?: IKubernetes) {
        this.client = client;
        const path = options.parameters.path;
        const name = options.parameters.name;
        const namespace = options.parameters.namespace;
        if (path && name && namespace) {
            await this.watch(name, namespace, path);
        }
    }

    private async watch(name: string, namespace: string, path: string) {
        const result = await this.client.api.v1.namespaces(namespace).configmaps(name).get();
        const data = get(result, 'body.data', { [path]: '' });
        const { accounts, roles, roleBindings } = parse(data[path]);
        this.store.init(accounts, roles, roleBindings);

        const events = await (this.client.api.v1.watch.namespaces(namespace).configmaps(name) as any).getObjectStream();
        events.on('data', event => {
            if (event.type === 'ADDED' || event.type === 'MODIFIED') {
                const data = get(event, 'object.data', { [path]: '' });
                const { accounts, roles, roleBindings } = parse(data[path]);
                this.store.init(accounts, roles, roleBindings);
            }
        });
    }
}
