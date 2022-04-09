const slimValue = (value) => {
    const newValue = (typeof value === 'string' && value.length && value) // picks defined string
        || (/^-?[\d.]+$/.test(`${value}`) && /^-?[^0]/.test(`${value}`) && value) // picks non 0 number
        || (Array.isArray(value) && value.length && slimArray(value)) // picks defined array
        || (value && Object.keys(value).length && slimObject(value)) // picks defiend object
        || (typeof value === 'boolean' && value) // allows boolean, false will be ignored

    return newValue
}

const slimArray = arr => {
    const newArray = arr
        .reduce((acc, item) => [
            ...acc,
            ...([slimValue(item)])
        ], [])

    return newArray.length && newArray
}

const slimObject = obj => {
    const newObject = Object.entries(obj)
        .reduce((acc, [key, value]) => {
            const newValue = slimValue(value)

            return {
                ...acc,
                ...( newValue
                    ? { [key]: newValue }
                    : {}
                )
            }
        }, {});

    return Object.keys(newObject).length && newObject
}

export {
    slimValue,
    slimArray,
    slimObject,
}
