import { Injectable } from '@nestjs/common';
import { EtcdValidator } from "./etcd-validator";
import { UseValidators } from "../decorators/use-validators.decorator";

@Injectable()
@UseValidators(EtcdValidator)
export class EtcdValidatorRegister {
}
