const { path, prop, sum } = require('ramda');

const getNameList = (data, key, preSorted = false) => {
    const scoredData = {}
    const nameMap = {}
    data
        .forEach((userData) => {
            const author = userData.author
            const keyData = userData[key] || {}
            const given = sum(Object.values(keyData))

            scoredData[author] = given
            nameMap[author] = userData.name || author
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
    const names = showNames.length === data.length - 1
        ? sortedValues.map(([x]) => x)
        : showNames

    const gitIds = preSorted
        ? data
            .filter(x => names.includes(x.author))
            .map(x => x.author)
        : names

    return [gitIds, gitIds.map(name => nameMap[name] || name)]
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
    otherAppended = false,
) => {
    const martixRow = (item) => [
        ...showNames.map(x => path([key, x], item) || 0),
        ...(
            otherAppended
                ? [otherTotal(showNames, prop(key, item))]
                : []
        ),
    ]

    const matrixRowsForNamed = showNames
        .map((name) => {
            const nameData = data.find(x => x.author === name)
            return martixRow(nameData)
        })

    let matrixRowForOther = []
    data
        .forEach((item) => {
            if (!showNames.some(x => x === item.author)) {
                const currentMatrix = martixRow(item)

                const mergedMatrix = currentMatrix
                    .map((value, i) => value + (matrixRowForOther[i] || 0))

                // Matrix other row can not have data to self logged, must be 0
                matrixRowForOther = [
                    ...mergedMatrix.slice(0, mergedMatrix.length - 1),
                    0,
                ]
            }
        })

    return [
        ...matrixRowsForNamed,
        ...(
            matrixRowForOther.length
                ? [matrixRowForOther]
                : []
        ),
    ]
}

const formatChordData = ({ data, key, preSorted, showNames = true }) => {
    const [showGitIds, showTheseNames] = getNameList(data, key, preSorted)
    const otherAppended = showTheseNames.length < data.length

    const matrix = getMatrix(data, key, showGitIds, otherAppended)

    const names = [
        ...showTheseNames,
        ...(
            otherAppended
                ? ['Others']
                : []
        ),
    ]

    return {
        names: showNames
            ? names
            : names.map((x, i) => {
                // whitespace needed to keep names unique
                const append = Array(i).fill(' ').join('')
                return `Spartacus${append}`
            }),
        matrix,
    }
}

export default formatChordData
