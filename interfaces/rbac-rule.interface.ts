export interface IRbacRule {
    resources: string[];
    verbs: string[];
    extras?: any;
}
