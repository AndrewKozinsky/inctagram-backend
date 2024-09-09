export type FunctionFirstArgument<T extends (...args: any) => any> = Parameters<T>[0]
