
const baseUserData = {
    author: '',
    approvalsGiven: 0,
    approvalsByUser: {},
    commentsGiven: 0,
    commentsReceived: 0,
    codeCommentsGiven: 0,
    codeCommentsReceived: 0,
    generalCommentsGiven: 0,
    generalCommentsReceived: 0,
    totalPRs: 0,
    uniquePRsContributedTo: 0,
    commentsByUser: {},
}

const updateContributorCount = (currentData, objKey, obj, addition) => Object.entries(obj)
    .reduce((acc, [key, value]) => {
        const prevData = currentData[key] || {}
        const updated = {
            ...baseUserData,
            ...prevData,
            user: key,
            [objKey]: (prevData[objKey] || 0) + (addition || value),
        }

        return Object.assign(acc, { [key]: updated })
    }, {})

const formatUserData = (data = []) => {
    const updateByUsersCount = (currentData, objKey, obj, author) => Object.entries(obj)
        .reduce((acc, [key, value]) => {
            const currentUserData = currentData[key] || {}
            const currentKeyData = currentUserData[objKey] || {}
            const updatedKeyData = {
                ...currentKeyData,
                [author]: (currentKeyData[author] || 0) + (value || 0),
            }

            const updated = {
                ...baseUserData,
                ...currentUserData,
                author: key,
                [objKey]: updatedKeyData,
            }

            return Object.assign(acc, { [key]: updated })
        }, {})
    const userData = data
        .reduce((acc, prData) => {
            const {
                author,
                prSize = 0,
                age = 0,
                approvals,
                approvers = {},
                comments,
                commenters = {},
                codeComments,
                codeCommenters = {},
                generalComments,
                generalCommenters = {},
            } = prData

            const updatedCommentsByUser = updateByUsersCount(acc, 'commentsByUser', commenters, author)
            Object.assign(acc, updatedCommentsByUser)

            const updatedApprovalsByUser = updateByUsersCount(acc, 'approvalsByUser', approvers, author)
            Object.assign(acc, updatedApprovalsByUser)

            const updatedCommentsGiven = updateContributorCount(acc, 'commentsGiven', commenters)
            Object.assign(acc, updatedCommentsGiven)

            const updatedCodeCommentsGiven = updateContributorCount(acc, 'codeCommentsGiven', codeCommenters)
            Object.assign(acc, updatedCodeCommentsGiven)

            const updatedGeneralCommentsGiven = updateContributorCount(acc, 'generalCommentsGiven', generalCommenters)
            Object.assign(acc, updatedGeneralCommentsGiven)

            const updatedApprovalsGiven = updateContributorCount(acc, 'approvalsGiven', approvers)
            Object.assign(acc, updatedApprovalsGiven)

            const updatedUniquePRsApproved = updateContributorCount(acc, 'uniquePRsApproved', approvers, 1)
            Object.assign(acc, updatedUniquePRsApproved)

            const contrtibutors = [...new Set([
                ...Object.keys(codeCommenters),
                ...Object.keys(generalCommenters),
                ...Object.keys(approvers),
            ])]

            contrtibutors
                .forEach((key) => {
                    const prevData = acc[key] || {}
                    const updated = {
                        ...baseUserData,
                        ...prevData,
                        author: key,
                        uniquePRsContributedTo: (prevData.uniquePRsContributedTo || 0) + 1,
                    }

                    Object.assign(acc, { [key]: updated })
                })


            const prevData = acc[author] || {}

            const prSizes = [...(prevData.prSizes || []), prSize]
            const averagePrSize = Math.round(prSizes.reduce((acc, x) => acc + x, 0) / prSizes.length)

            const prAges = [...(prevData.prAges || []), age]
            const averagePrAge = Math.round(prAges.reduce((acc, x) => acc + x, 0) / prAges.length)

            return Object.assign(acc, {
                [author]: {
                    ...baseUserData,
                    ...prevData,
                    author,
                    user: author,
                    approvalsReceived: (prevData.approvalsReceived || 0) + approvals,
                    commentsReceived: (prevData.commentsReceived || 0) + comments,
                    codeCommentsReceived: (prevData.codeCommentsReceived || 0) + codeComments,
                    generalCommentsReceived: (prevData.generalCommentsReceived || 0) + generalComments,
                    totalPRs: (prevData.totalPRs || 0) + 1,
                    prSizes,
                    prSize: averagePrSize,
                    prAges,
                    age: averagePrAge,
                },
            })

        }, {})


    const uniqueAuthors = [...new Set(data.map(x => x.author))]

    const newUsersData = Object.values(userData)
        .filter(({ author }) => uniqueAuthors.some(x => x === author))

    const keys = [
        'commentsGiven',
        'commentsReceived',
        'approvalsGiven',
        'approvalsReceived',
    ]

    const sortedUsers = newUsersData
        .sort((a, b) => {
            const aTotal = keys
                .reduce((acc, key) => acc + (a[key] || 0), 0)

            const bTotal = keys
                .reduce((acc, key) => acc + (b[key] || 0), 0)
            return bTotal - aTotal
        })

    return sortedUsers
}

export default formatUserData