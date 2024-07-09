import { ObjNumbers } from "./types/Components"

const sumKeysValue = (key = '') => (items: any[] = []) => items
    .reduce((acc: number, current = {}) => (current[key] as number || 0) + acc, 0)

const sumObjectKeys = (keys: string[] = []) => (obj:ObjNumbers = {}) => keys
    .reduce((acc, key) => acc + (obj[key] as number || 0), 0)

const sortByKeys = (keys: string[] = []) => (a: any, b: any) => {
    const sumKeysFrom = sumObjectKeys(keys)
    const aTotal = sumKeysFrom(a)
    const bTotal = sumKeysFrom(b)

    return bTotal - aTotal
}

export {
    sumKeysValue,
    sortByKeys,
}