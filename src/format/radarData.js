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
        .sort((a, b) => {
            const aTotal = keys
                .reduce((acc, key) => acc + (a[key] || 0), 0)

            const bTotal = keys
                .reduce((acc, key) => acc + (b[key] || 0), 0)
            return bTotal - aTotal
        })

    const p10 = Math.ceil(sortedUsers.length / 100 * 10)
    const topUsers = p10 > 10
        ? sortedUsers.slice(0, p10)
        : sortedUsers

    const totalled = topUsers
        .filter(x => !filterAuthor || x.author !== filterAuthor)
        .reduce((total, user) => {
            const addedUser = Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value) && value > 0)
                .reduce((combinedData, [key, value]) => Object.assign(combinedData, { [key]: value + (total[key] || 0) }), {})

            return Object.assign(total, addedUser)
        }, {})

    const userCount = topUsers.length
    const averagedData = Object.entries(totalled)
        .reduce((acc, [key, value], i) =>
            Object.assign(
                acc, { [key]: Math.round(value / userCount) }
            ), { ...defaultValues, user: 'Peers', userCount }
        )

    const usersData = userData
        .find(x => x.author === filterAuthor) || { approvalsGivenByTeam: {} }

    const maxValues = userData
        .reduce((parentAcc, user) => {
            const withNumberValue = Object.entries(user)
                .filter(([, value]) => !Array.isArray(value) && /^\d+$/.test(value))

            const upDateMaxValues = withNumberValue
                .reduce((acc, [key, value]) => {
                    const accVaue = parentAcc[key] || 0

                    return Object.assign(acc, { [key]: accVaue > value ? accVaue : value })
                }, {})

            return Object.assign(parentAcc, upDateMaxValues)
        }, defaultValues)

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