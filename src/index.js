/**
 * 
 * @author starkwang 
 * @blog shudong.wang 
 */

export const isFunc = v => typeof v === 'function'
export const isObject = v => v && typeof v === 'object'
export const isPromise = obj => isObject(obj) && isFunc(obj.then)
export const hasPromise = obj =>
  isObject(obj) && Object.keys(obj).some(key => isPromise(obj[key]))
export const hasDeps = fn => getDeps(fn) !== null


const dispatchAction = (commit, action, status) => {
  const { type, payload } = action
  commit(type, { status, payload })
}

export const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
}
const commitPending = (commit, action) => {
  commit(action.type, { status: STATUS.PENDING, payload: null })
}

const commitSuccess = (commit, action) => {
  dispatchAction(commit, action, STATUS.SUCCESS)
}

const commitError = (commit, action) => {
  dispatchAction(commit, action, STATUS.ERROR)
}

export const createAction = (type, payloadCreator) => {
  const finalPayloadCreator = isFunc(payloadCreator)
    ? payloadCreator
    : (...args) => args[0]
  return ({ dispatch, commit }, ...args) => {
    const payload = finalPayloadCreator(...args)
    const action = { type, payload }
    commit = commit || dispatch
    try {
      if (isPromise(payload)) {
        return payload.then(
          result => {
            commitSuccess(
              commit,
              Object.assign(action, { payload: result.data })
            )
            return result.data
          },
          error =>
            commitError(commit, Object.assign(action, { payload: error }))
        )
      }

      if (hasPromise(payload)) {
        const promiseQueue = buildPromiseQueue(payload)
        commitPending(commit, action)
        return promiseQueue
          .run(...args)
          .then(result => commitSuccess(commit, action))
          .catch(error =>
            commitError(commit, Object.assign(action, { payload: error }))
          )
      }

      return commitSuccess(commit, action)
    } catch (error) {
      console.log(error)
    }
  }
}

export const createActionStatus = (type, payloadCreator) => {
  const finalPayloadCreator = isFunc(payloadCreator)
    ? payloadCreator
    : (...args) => args[0]
  return ({ dispatch, commit }, ...args) => {
    const payload = finalPayloadCreator(...args)
    const action = { type, payload }
    commit = commit || dispatch
    try {
      if (isPromise(payload)) {
        commitPending(commit, action)
        return payload.then(
          result => {
            commitSuccess(
              commit,
              Object.assign(action, { payload: result.data })
            )
            return result.data
          },
          error =>
            commitError(commit, Object.assign(action, { payload: error }))
        )
      }

      if (hasPromise(payload)) {
        const promiseQueue = buildPromiseQueue(payload)
        commitPending(commit, action)
        return promiseQueue
          .run(...args)
          .then(result => commitSuccess(commit, action))
          .catch(error =>
            commitError(commit, Object.assign(action, { payload: error }))
          )
      }

      return commitSuccess(commit, action)
    } catch (error) {
      console.log(error)
    }
  }
}
