import { sortByKeys } from '../utils'
const formatRadarData = (userData, filterAuthor) => {

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

    const filteredContributors = userData
        .filter(x => filterAuthor
            ? x.author !== filterAuthor
            : true)
        .filter(({
            commentsGiven,
            commentsReceived,
            approvalsGiven,
            approvalsReceived,
        }) => [
            commentsGiven,
            commentsReceived,
            approvalsGiven,
            approvalsReceived,
        ].some(x => x > 1))

    const keys = [
        'commentsGiven',
        'commentsReceived',
        'approvalsGiven',
        'approvalsReceived',
    ]

    const sortedUsers = filteredContributors
        .sort(sortByKeys(keys))

    const p10 = Math.ceil(sortedUsers.length / 100 * 10)
    const topUsers = p10 > 10
        ? sortedUsers.slice(0, p10)
        : sortedUsers

    const totalled = {}
    topUsers
        .filter(x => !filterAuthor || x.author !== filterAuthor)
        .forEach((user) => {
            Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value) && value > 0)
                .forEach(([key, value]) => {
                    const current = totalled[key] || 0
                    totalled[key] = value + current
                })
        })

    const userCount = topUsers.length
    const averagedData = { ...defaultValues, user: 'Peers', userCount }
    Object.entries(totalled)
        .forEach(([key, value]) => {
            averagedData[key] = Math.round(value / userCount)
        })

    const usersData = userData
        .find(x => x.author === filterAuthor) || { approvalsGivenByTeam: {} }

    const maxValues = defaultValues
    userData
        .forEach((user) => {
            const withNumberValue = Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value))

            withNumberValue
                .forEach(([key, value]) => {
                    const accVaue = maxValues[key] || 0

                    maxValues[key] = accVaue > value
                        ? accVaue
                        : value
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