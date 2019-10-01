export type Reducer<R, C> =
  (reduction: R, current: C) => R

export interface Action<Type extends string> {
  type: Type
}

export interface ActionWithPayload<Type extends string, Payload> {
  type: Type
  payload: Payload
}

export interface SimpleActionCreator<Type extends string> {
  readonly type: Type

  (): Action<Type>
}

export interface ActionWithPayloadCreator<Type extends string, PayloadCreator extends (...args: any[]) => any> {
  readonly type: Type

  (...args: Parameters<PayloadCreator>): ActionWithPayload<Type, ReturnType<PayloadCreator>>
}

export interface AnyAction<Type extends string = string> extends Action<Type> {
  [key: string]: any
}
