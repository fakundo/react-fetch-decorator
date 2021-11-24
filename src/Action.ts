enum Status {
  DEFAULT,
  PENDING,
  SUCCEDED,
  FAILED,
}

const getUpdateComponent = (updateSpecific, updateCommon) => (
  updateSpecific === undefined ? updateCommon : updateSpecific
)

export const isCancel = (error) => (
  error.ABORT_ERR && error.code === error.ABORT_ERR
)

export class Action {
  createAction: ((abortSignal: AbortSignal) => (...args) => Promise<any>)
    | ((abortSignal: AbortSignal) => Promise<any>);
  onStatusUpdate: (updateComponent: boolean) => {};
  abortController: AbortController;
  status: Status;
  result: any;
  error: Error;
  key: number;

  constructor(createAction, onStatusUpdate) {
    this.createAction = createAction
    this.onStatusUpdate = onStatusUpdate
    this.status = Status.DEFAULT
  }

  getState: () => ActionPropType = () => ({
    isDefault: this.status === Status.DEFAULT,
    isPending: this.status === Status.PENDING,
    isSucceded: this.status === Status.SUCCEDED,
    isFailed: this.status === Status.FAILED,
    result: this.result,
    error: this.error,
    reset: this.reset,
    run: this.run,
  })

  updateKey = () => {
    this.key = Math.random()
    return this.key
  }

  updateStatus({ key, status, updateComponent, result = undefined, error = undefined }) {
    if (key === this.key) {
      this.status = status
      this.result = result
      this.error = error
      this.onStatusUpdate(updateComponent)
    }
  }

  abort = () => {
    if (this.status === Status.PENDING) {
      this.abortController.abort()
    }
  }

  run = async ({
    args = [],
    silent = false,
    abortPending = true,
    updateComponent = true,
    updateComponentOnPending = undefined,
    updateComponentOnSuccess = undefined,
    updateComponentOnFailure = undefined,
  }: {
    args?: any[]
    silent?: boolean
    abortPending?: boolean
    updateComponent?: boolean
    updateComponentOnPending?: boolean
    updateComponentOnSuccess?: boolean
    updateComponentOnFailure?: boolean
  } = {}) => {
    // Create new key
    const key = this.updateKey()

    // Cancel already pending request
    if (abortPending) {
      this.abort()
    }

    // Create new cancel token source
    this.abortController = new AbortController()

    // Change status to pending
    this.updateStatus({
      key,
      status: Status.PENDING,
      updateComponent: getUpdateComponent(updateComponentOnPending, updateComponent),
    })

    try {
      // Create action passing abort signal to creator
      const action = this.createAction(this.abortController.signal)

      // Await action result
      const result = typeof action === 'function'
        ? await action(...args)
        : await action

      // Update status to succeded
      this.updateStatus({
        key,
        result,
        status: Status.SUCCEDED,
        updateComponent: getUpdateComponent(updateComponentOnSuccess, updateComponent),
      })
    } catch (error) {
      if (isCancel(error)) {
        // Request has been cancelled, update status to default
        this.updateStatus({
          key,
          status: Status.DEFAULT,
          updateComponent: getUpdateComponent(updateComponentOnFailure, updateComponent),
        })
      } else {
        // Action failed, update status to failed
        this.updateStatus({
          key,
          error,
          status: Status.FAILED,
          updateComponent: getUpdateComponent(updateComponentOnFailure, updateComponent),
        })
      }

      // Throw error to upper scope
      if (!silent) {
        throw error
      }
    }

    // Return action result
    return this.result
  }

  reset = ({
    abortPending = true,
    updateComponent = true,
  } = {}) => {
    if (this.status === Status.DEFAULT) {
      return
    }

    const key = this.updateKey()

    if (abortPending) {
      this.abort()
    }

    this.updateStatus({
      key,
      status: Status.DEFAULT,
      updateComponent,
    })
  }
}

export type ActionPropType = {
  isDefault: boolean
  isPending: boolean
  isSucceded: boolean
  isFailed: boolean
  result: any
  error: Error | undefined
  reset: Action['reset']
  run: Action['run']
}
