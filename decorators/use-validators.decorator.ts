import { IRbacValidator } from "../interfaces/rbac-validator.interface";
import { VALIDATOR_METADATA } from "../rbac.constants";

export function UseValidators(...filters: (IRbacValidator | Function)[]) {
    return applyDecorators(
        ExtendArrayMetadata(VALIDATOR_METADATA, filters),
        ExtendArrayMetadata('__guards__', filters),
    );
}

function applyDecorators(
    ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
    return <TFunction extends Function, Y>(
        target: TFunction | Object,
        propertyKey?: string | symbol,
        descriptor?: TypedPropertyDescriptor<Y>,
    ) => {
        for (const decorator of decorators) {
            if (target instanceof Function) {
                (decorator as ClassDecorator)(target);
                continue;
            }
            (decorator as MethodDecorator | PropertyDecorator)(
                target,
                propertyKey,
                descriptor,
            );
        }
    };
}

const ExtendArrayMetadata = <K = any, V = any>(
    metadataKey: K,
    metadataValues: Array<V>,
) => (target: object, key?: any, descriptor?: any) => {
    if (descriptor) {
        const previousValue = Reflect.getMetadata(metadataKey, descriptor.value) || [];
        const value = [...previousValue, ...metadataValues];
        Reflect.defineMetadata(metadataKey, value, descriptor.value);
        return descriptor;
    }

    const previousValue = Reflect.getMetadata(metadataKey, target) || [];
    const value = [...previousValue, ...metadataValues];
    Reflect.defineMetadata(metadataKey, value, target);
    return target;
};
