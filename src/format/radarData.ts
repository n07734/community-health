import { ObjPrimitive, ObjNumbers } from '../types/Components';
import { UserData, UserDataNumbers } from '../types/State'
import { sortByKeys } from '../utils'

const formatRadarData = (userData: UserData[], filterAuthor?:string) => {

    const defaultValues = {
        age: 0,
        approvalsGiven: 0,
        approvalsReceived: 0,
        codeCommentsGiven: 0,
        codeCommentsReceived: 0,
        commentsGiven: 0,
        commentsReceived: 0,
        generalCommentsGiven: 0,
        generalCommentsReceived: 0,
        prSize: 0,
        totalPRs: 0,
        uniquePRsApproved: 0,
        uniquePRsContributedTo: 0,
    }

    type PartialUserDataKeys = keyof Partial<UserDataNumbers>;
    const keys:PartialUserDataKeys[] = [
        'commentsGiven',
        'commentsReceived',
        'uniquePRsApproved',
        'totalPRs',
    ]

    const filteredContributors = userData
        .filter((user) => {
            const okAuthor = filterAuthor
                ? user.author !== filterAuthor
                : true

            const hasData = keys
                .some((x) => user[x] > 1)

            return okAuthor && hasData
        })

    const sortedUsers = filteredContributors
        .sort(sortByKeys(keys))

    const p10 = Math.ceil(sortedUsers.length / 100 * 10)
    const topUsers = p10 > 10
        ? sortedUsers.slice(0, p10)
        : sortedUsers

    const totalled:ObjNumbers = {}
    topUsers
        .filter(x => !filterAuthor || x.author !== filterAuthor)
        .forEach((user) => {
            Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value as string) && value as number > 0)
                .forEach(([key, value ]) => {
                    const current = totalled[key] || 0
                    totalled[key] = +value + current
                })
        })

    const userCount = topUsers.length
    const averagedData:ObjPrimitive = { ...defaultValues, user: 'Peers', userCount }
    Object.entries(totalled)
        .forEach(([key, value]) => {
            averagedData[key] = Math.round(value / userCount)
        })

    const usersData = userData
        .find(x => x.author === filterAuthor) || { approvalsGivenByTeam: {} }

    const maxValues:ObjNumbers = defaultValues
    userData
        .forEach((user) => {
            Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value as string) && value as number > 0)
                .forEach(([key, value]) => {
                    const accVaue = (maxValues[key] || 0) as number

                    const numberValue = +value

                    maxValues[key] = accVaue > numberValue
                        ? accVaue
                        : numberValue
                })
        })

    return {
        averagedData,
        maxValues,
        users: userData,
        user: filterAuthor
            ? usersData
            : {},
    }
}

export default formatRadarData