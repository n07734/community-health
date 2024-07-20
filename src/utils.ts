import { ObjNumbers } from './types/Components'
import { SortDirection } from './types/Querys'


const sumKeysValue = (key: string) => <I>(items: I[] = []) => items
    .reduce((acc: number, current:I) => (current[key as keyof I] as number || 0) + acc, 0)

const sumObjectKeys = (keys: string[] = []) => (obj:ObjNumbers = {}) => keys
    .reduce((acc, key) => acc + (obj[key] as number || 0), 0)

const sortByKeys = (keys: string[] = []) => (a: any, b: any) => {
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