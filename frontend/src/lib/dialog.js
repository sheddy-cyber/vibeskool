import { create } from 'zustand'

/* Site-wide confirmation dialogs and notifications, used instead of the
   browser's window.confirm and alert.

     if (await confirmDialog({ title: 'Delete this?', tone: 'danger' })) { … }
     notify({ title: 'Saved', tone: 'success' })

   Both are rendered once by <DialogHost /> at the root of the app. */

let toastId = 0

export const useDialogs = create((set, get) => ({
  confirm: null, // { title, body, confirmLabel, cancelLabel, tone, resolve }
  toasts: [],

  openConfirm: (opts) => new Promise((resolve) => {
    // A second request while one is open: settle the first as cancelled
    get().confirm?.resolve(false)
    set({ confirm: { ...opts, resolve } })
  }),
  closeConfirm: (result) => {
    const c = get().confirm
    if (!c) return
    set({ confirm: null })
    c.resolve(result)
  },

  push: (t) => {
    const id = (toastId += 1)
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, ...t }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/**
 * Ask the user to confirm an action.
 * @param {{ title: string, body?: string, confirmLabel?: string, cancelLabel?: string, tone?: 'default'|'danger' }} opts
 * @returns {Promise<boolean>}
 */
export function confirmDialog(opts) {
  return useDialogs.getState().openConfirm({
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    tone: 'default',
    ...opts,
  })
}

/**
 * Show a short notification. Pass a string, or { title, body, tone }.
 * tone: 'success' | 'error' | 'info'
 */
export function notify(input) {
  const t = typeof input === 'string' ? { title: input } : input
  return useDialogs.getState().push({ tone: 'info', duration: t.tone === 'error' ? 6000 : 4000, ...t })
}
