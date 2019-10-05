import { AnyAction, Reducer } from './types'

export const whenAction = <S>(...reducers: readonly Reducer<S, { type: any } | any>[]) => {
  const reduce = reducers.reduce(reduceReducer, identityReducer)

  return (...initialState: [] | [S]) =>
    initialState.length === 0
      ? (state: S, action: AnyAction<any>): S =>
        reduce(state, action)
      : (state: S = initialState[0], action: AnyAction<any>): S =>
        reduce(state, action)
}

export const is = <S, T extends string, A extends { type: T }>(
  createdBy: ({ type: T, (...args: any[]): A }) | string,
  reduceItBy: (state: S, action: A) => S,
): (state: S, action: A) => S =>
  typeof createdBy === 'function'
    ? (state, action) =>
      action.type === createdBy.type
        ? reduceItBy(state, action)
        : state
    : (state, action) =>
      action.type === createdBy
        ? reduceItBy(state, action)
        : state

export const combineReducers = <S extends object>(
  reducers: Record<keyof S, Reducer<S[keyof S], AnyAction<any>>>
) => {
  const keys = Object.keys(reducers) as (keyof S)[]
  const lastIndex = keys.length - 1

  return (state: S, action: AnyAction<any>) => {
    const newState = { ...state }

    for (let i = lastIndex; i >= 0; --i) {
      const key = keys[i]
      newState[key] = reducers[key](state[key], action)
    }

    return newState
  }
}

const reduceReducer = <S>(
  finalReducer: Reducer<S, AnyAction<any>>,
  currentReducer: Reducer<S, AnyAction<any>>,
) =>
  (state: S, action: AnyAction<any>) =>
    finalReducer(currentReducer(state, action), action)

const identityReducer = <S>(state: S) => state
