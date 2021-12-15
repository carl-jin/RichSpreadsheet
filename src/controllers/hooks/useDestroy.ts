import Store from '../../store'

export function useDestroy() {
  Store?.GS?.destroy()
}
