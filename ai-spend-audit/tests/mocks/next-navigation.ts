export function useRouter() {
    return {
        push: () => undefined,
        replace: () => undefined,
        refresh: () => undefined,
        prefetch: () => Promise.resolve(undefined)
    }
}

export function notFound() {
    throw new Error('notFound called')
}
