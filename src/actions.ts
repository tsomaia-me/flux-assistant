import { ActionWithPayloadCreator, SimpleActionCreator } from './types'

export function $<T extends string>(type: T): SimpleActionCreator<T>
export function $<T extends string, P extends (...args: any[]) => any>(
  type: T,
  payload: P
): ActionWithPayloadCreator<T, P>
export function $<T extends string>(props: {
  type: T
}): SimpleActionCreator<T>
export function $<T extends string, P extends (...args: any[]) => any>(props: {
  type: T
  payload: P
}): ActionWithPayloadCreator<T, P>
export function $<T extends string, P extends (...args: any[]) => any>(
  typeOrProps: T | {
    type: T,
    payload?: P
  },
  createPayload?: P
) {
  if (typeof typeOrProps === 'object') {
    return createActionWithMaybePayloadCreator(typeOrProps)
  }

  if (typeof createPayload === 'function') {
    return createActionWithMaybePayloadCreator({
      type: typeOrProps,
      payload: createPayload,
    })
  }

  return createSimpleActionCreator(typeOrProps)
}

export const createActionCreator = $

const createActionWithMaybePayloadCreator = <T extends string, P extends (...args: any[]) => any>(
  props: {
    type: T
    payload?: P
  }
) => {
  if (props.payload === void 0) {
    return createSimpleActionCreator(props.type)
  }

  return createActionWithPayloadCreator(props as {
    type: T
    payload: P
  })
}

const createSimpleActionCreator = <T extends string>(type: T) =>
  withType(type, () => ({
    type,
  }))

const createActionWithPayloadCreator = <T extends string, P extends (...args: any[]) => any>(
  { type, payload }: {
    type: T
    payload: P
  }
) =>
  withType(type, (...args: Parameters<P>) => ({
    type: type,
    payload: payload(...args),
  }))

const withType = <T extends string, A extends { type?: T, (...args: any[]): any }>(
  type: T,
  createAction: A
) => {
  createAction.type = type
  return createAction as A & { type: T }
}
