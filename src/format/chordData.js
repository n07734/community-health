const { path, prop, sum } = require('ramda');

const getNameList = (data, key) => {
    const scoredData = {}
    data
        .forEach((userData) => {
            const author = userData.author
            const keyData = userData[key] || {}
            const given = sum(Object.values(keyData))

            scoredData[author] = given
        })

    const sortedValues = Object.entries(scoredData)
        .sort(([, a], [, b]) => b - a)

    const total = sum(Object.values(scoredData))

    const percentageOfTotal = (value) => {
        const percentPerUnit = 100 / total
        const percentOf = value * percentPerUnit

        return percentOf
    }

    const showNames = []
    sortedValues
        .forEach(([author, value]) => {
            const itemsPercent = percentageOfTotal(value)

            value > 0
                && itemsPercent > 5
                && showNames.push(author)
        })

    // We do not want only one user going into the "Other" group
    return showNames.length === data.length - 1
        ? sortedValues.map(([x]) => x)
        : showNames
}

const otherTotal = (ignoreNames = [], data = {}) => {
    const otherAuthors = Object.entries(data)
        .filter(([name]) => !ignoreNames.some(x => x === name))

    const total =  sum(otherAuthors.map(x => x[1]))
    return total
}

const getMatrix = (
    data = [],
    key = '',
    showNames = [],
    otherAppened = false,
) => {
    const martixRow = (item) => [
        ...showNames.map(x => path([key, x], item) || 0),
        ...(
            otherAppened
                ? [otherTotal(showNames, prop(key, item))]
                : []
        ),
    ]

    const matrixRowsForNamed = showNames
        .map((name) => {
            const nameData = data.find(x => x.author === name)
            return martixRow(nameData)
        })

    const matrixRowForOther = data
        .filter(({ author }) => !showNames.some(x => x === author))
        .reduce((acc, item) => {
            const currentMatrix = martixRow(item)

            const mergedMatrix = currentMatrix
                .map((value, i) => value + (acc[i] || 0))

            // Matrix other row can not have data to self logged, must be 0
            return [
                ...mergedMatrix.slice(0, mergedMatrix.length - 1),
                0,
            ]
        }, [])

    return [
        ...matrixRowsForNamed,
        ...(
            matrixRowForOther.length
                ? [matrixRowForOther]
                : []
        ),
    ]
}

const formatChordData = (data, key) => {
    const showNames = getNameList(data, key)
    const otherAppened = showNames.length < data.length

    const matrix = getMatrix(data, key, showNames, otherAppened)

    const names = [
        ...showNames,
        ...(
            otherAppened
                ? ['Others']
                : []
        ),
    ]

    return {
        names,
        matrix,
    }
}

export default formatChordData
