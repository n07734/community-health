import { SortDirection } from './types/Queries'
import { KeysOfValue } from './types/State'


const sumKeysValue = (key: string) => <I>(items: I[] = []) => items
    .reduce((acc: number, current:I) => (current[key as keyof I] as number || 0) + acc, 0)

const sumObjectKeys = <T>(keys: KeysOfValue<T, number>[]) => (obj:T) => keys
    .reduce((acc:number, key:keyof T) => acc + (obj && obj[key] as number || 0), 0)

const sortByKeys = <T>(keys: KeysOfValue<T, number>[] = []) => (a: T, b: T) => {
    const sumKeysFrom = sumObjectKeys(keys)
    const aTotal = sumKeysFrom(a)
    const bTotal = sumKeysFrom(b)

    return bTotal - aTotal
}

const dateSort = (sortDirection: SortDirection) => (a:string, b:string) => sortDirection === 'DESC'
    ? new Date(b).getTime() - new Date(a).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

export {
    sumKeysValue,
    sortByKeys,
    dateSort,
}