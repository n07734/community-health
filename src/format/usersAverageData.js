import { sortByKeys } from '../utils'

const usersAverageData = (userData, filterAuthor) => {

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
        prTotalAdditions: 0,
        prTotalDeletions: 0,
        totalPRs: 0,
        uniquePRsApproved: 0,
        uniquePRsContributedTo: 0,
        sentimentAveragePositiveScore: 0,
        sentimentAverageNegativeScore: 0,
        orgCount: 0,
        repoCount: 0,
    }

    const keys = [
        'commentsGiven',
        'commentsReceived',
        'approvalsGiven',
        'approvalsReceived',
    ]

    const filteredContributors = userData
        .filter((user = {}) => {
            const okAuthor = user.author !== filterAuthor

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

    const totalled = {}
    topUsers
        .filter(x => x.author !== filterAuthor)
        .forEach((user) => {
            Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value) && value > 0)
                .forEach(([key, value]) => {
                    const current = totalled[key] || 0
                    totalled[key] = value + current
                })
        })

    const userCount = topUsers.length
    const averagedData = {
        ...defaultValues,
        user: 'Peers',
        name: 'Peers',
        userCount,
    }
    Object.entries(totalled)
        .forEach(([key, value]) => {
            averagedData[key] = Math.round(value / userCount)
        })

    const usersData = userData
        .find(x => x.author === filterAuthor) || { approvalsGivenByTeam: {} }

    return [
        {
            ...usersData,
            user: usersData.author,
            name: usersData.name || usersData.author,
        },
        averagedData,
    ]
}

export default usersAverageData