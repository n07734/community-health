import { path, sum } from 'ramda'
import { ObjNumbers, ObjStrings } from '../types/Components'
import { UserData, UserDataNumbers } from '../types/State'

const getNameList = (data: UserData[], key: keyof UserData, preSorted = false) => {
    const scoredData:ObjNumbers = {}
    const nameMap:ObjStrings = {}
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

    const percentageOfTotal = (value: number) => {
        const percentPerUnit = 100 / total
        const percentOf = value * percentPerUnit

        return percentOf
    }

    const showNames:string[] = []
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

const otherTotal = (ignoreNames:string[] = [], data:UserDataNumbers) => {
    const otherAuthors:[string, number][] = Object.entries(data)
        .filter(([name]) => !ignoreNames.some(x => x === name))

    const total =  sum(otherAuthors.map((x) => x[1] as number))
    return total
}

const getMatrix = (
    data: UserData[] = [],
    key: keyof UserDataNumbers,
    showNames: string[] = [],
    otherAppended = false,
) => {
    const martixRow = (item:UserData):number[] => [
        ...showNames.map((x):number => path([key, x], item) || 0),
        ...(
            otherAppended
                ? [otherTotal(showNames, item[key] as any)] // TODO: Que?? keyof not helping
                : []
        ),
    ]

    const matrixRowsForNamed = showNames
        .map((name) => {
            const nameData = data.find(x => x.author === name) as UserData
            return martixRow(nameData)
        })

    let matrixRowForOther:number[] = []
    data
        .forEach((item) => {
            if (!showNames.some(x => x === item.author)) {
                const currentMatrix = martixRow(item)

                const mergedMatrix = currentMatrix
                    .map((value, i:number) => value + (matrixRowForOther[i] || 0))

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

type FormatChordDataProps = {
    data: UserData[]
    dataKey: keyof UserDataNumbers
    preSorted?: boolean
    showNames?: boolean
}
const formatChordData = ({ data, dataKey, preSorted, showNames = true }:FormatChordDataProps) => {
    const [showGitIds, showTheseNames] = getNameList(data, dataKey, preSorted)
    const otherAppended = showTheseNames.length < data.length

    const matrix = getMatrix(data, dataKey, showGitIds, otherAppended)

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
            : names.map((_x, i) => {
                // whitespace needed to keep names unique
                const append = Array(i).fill(' ').join('')
                return `Spartacus${append}`
            }),
        matrix,
    }
}

export default formatChordData
