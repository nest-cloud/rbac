import { Injectable } from '@nestjs/common';
import { UseValidators } from "../decorators/use-validators.decorator";
import { ConsulValidator } from "./consul-validator";

@Injectable()
@UseValidators(ConsulValidator)
export class ConsulValidatorRegister {
}
