import { AnyObject } from "../types/Components"

const slimValue = <T>(value: T) => {
    const newValue = (typeof value === 'string' && value.length && value) // picks defined string
        || (/^-?[\d.]+$/.test(`${value}`) && /^-?[^0]/.test(`${value}`) && value) // picks non 0 number
        || (Array.isArray(value) && value.length && slimArray(value)) // picks defined array
        || (value && Object.keys(value).length && slimObject(value as AnyObject)) // picks defiend object
        || (typeof value === 'boolean' && value) // allows boolean, false will be ignored

    return newValue
}

const slimArray = <T>(items: T[]) => {
    const newArray: T[] = []
    items
        .forEach((item) => {
            const value = slimValue(item) as T
            value && newArray.push(value)
        })

    return newArray.length && newArray
}

const slimObject = (obj: AnyObject) => {
    const newObject: AnyObject = {}
    Object.entries(obj)
        .forEach(([key, value]) => {
            const newValue = slimValue(value)
            newValue && (newObject[key] = newValue)
        });

    return Object.keys(newObject).length && newObject
}

export {
    slimValue,
    slimArray,
    slimObject,
}
