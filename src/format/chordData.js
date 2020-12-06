const { path, prop } = require('ramda');

const getNameList = (data, key) => {
    const scoredData = data
        .reduce((acc, userData) => {
            const author = userData.author
            const keyData = userData[key] || {}
            const given = Object.values(keyData).reduce((acc, current) => acc + current, 0)

            return Object.assign(acc, { [author]: given })
        }, {})

    const sortedValues = Object.entries(scoredData)
        .sort(([, a], [, b]) => b - a)

    const total = sortedValues
        .reduce((acc, [, value]) => value + acc, 0)


    const percentageOfTotal = (value) => {
        const percentPerUnit = 100 / total
        const percentOf = value * percentPerUnit

        return percentOf
    }

    const { showNames } = sortedValues
        .reduce((
            { accPercent = 0, showNames = [] },
            [author, value],
        ) => {
            const itemPercent = percentageOfTotal(value, author, accPercent)
            const newAccPercent = accPercent + itemPercent

            return {
                accPercent: newAccPercent,
                showNames: value > 0 && itemPercent > 5
                    ? [
                        ...showNames,
                        author,
                    ]
                    : showNames,
            }
        }, {})

    // We do not want only one user going into the "Other" group
    return showNames.length === data.length - 1
        ? sortedValues.map(([x]) => x)
        : showNames
}

const getMatrix = (data, key, showNames, otherAppened) => {
    const otherTotal = (ignoreNames, data = {}) => Object.entries(data)
        .reduce((acc, [name, value]) => ignoreNames.some(x => x === name)
            ? acc
            : acc + value, 0)

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
