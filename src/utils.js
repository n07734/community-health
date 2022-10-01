const sumKeysValue = (key = '') => (items = []) => items
    .reduce((acc, current = {}) => (current[key] || 0) + acc, 0)

const sumObjectKeys = (keys = []) => (obj = {}) => keys
    .reduce((acc, key) => acc + (obj[key] || 0), 0)

const sortByKeys = (keys = []) => (a, b) => {
    const sumKeysFrom = sumObjectKeys(keys)
    const aTotal = sumKeysFrom(a)
    const bTotal = sumKeysFrom(b)

    return bTotal - aTotal
}

export {
    sumKeysValue,
    sortByKeys,
}