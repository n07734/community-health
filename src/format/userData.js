
import { sum } from 'ramda'
import { sortByKeys } from '../utils'

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

const updateContributorCount = (currentData, objKey, obj, addition) => {
    const contributorCount = {}
    Object.entries(obj)
        .forEach(([key, value]) => {
            const prevData = currentData[key] || {}
            const updated = {
                ...baseUserData,
                ...prevData,
                user: key,
                [objKey]: (prevData[objKey] || 0) + (addition || value),
            }

            contributorCount[key] = updated
        })

    return contributorCount
}

const updateByUsersCount = (currentData, objKey, obj, author) => {
    const byUsersCount = {}
    Object.entries(obj)
        .forEach(([key, value]) => {
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

            byUsersCount[key] = updated
        })

    return byUsersCount
}

const formatUserData = (data = []) => {
    // TODO: This is too complex, break it down into something that makes more sense
    // Also not reduce
    const userData = data
        .reduce((acc, prData) => {
            const {
                org,
                repo,
                author,
                prSize = 0,
                additions = 0,
                deletions = 0,
                age = 0,
                approvals = 0,
                approvers = {},
                comments = 0,
                commenters = {},
                codeComments = 0,
                codeCommenters = {},
                generalComments = 0,
                generalCommenters = {},
                commentSentimentTotalScore = 0,
                commentSentimentScore = 0,
                commentAuthorSentimentScore = 0,
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
            const averagePrSize = Math.round(sum(prSizes) / prSizes.length)

            const prAdditions = [...(prevData.prAdditions || []), additions]
            const prTotalAdditions = sum(prAdditions)

            const prDeletions = [...(prevData.prDeletions || []), deletions]
            const prTotalDeletions = sum(prDeletions)

            const prAges = [...(prevData.prAges || []), age]
            const prTotalAge = sum(prAges)
            const averagePrAge = Math.round(sum(prAges) / prAges.length)

            const sentimentTotal = commentSentimentTotalScore || (commentSentimentScore + commentAuthorSentimentScore)
            const sentimentTotalScores = [...(prevData.sentimentTotalScores || []), sentimentTotal]

            const positiveScores = sentimentTotalScores
                .filter(x => x >= 0)
            const sentimentAveragePositiveScore = Math.round(sum(positiveScores) / positiveScores.length)
            const sentimentTotalPositiveScore = sum(positiveScores)

            const negativeScores = sentimentTotalScores
                .filter(x => x < 0)
            const sentimentAverageNegativeScore = Math.round(sum(negativeScores) / negativeScores.length)
            const sentimentTotalNegativeScore = sum(negativeScores)

            const orgs = [...new Set([...(prevData.orgs || []), org])]
            const orgCount = orgs.length

            const repos = [...new Set([...(prevData.repos || []), repo])]
            const repoCount = repos.length

            return Object.assign(acc, {
                [author]: {
                    ...baseUserData,
                    ...prevData,
                    orgs,
                    orgCount,
                    repos,
                    repoCount,
                    author,
                    user: author,
                    approvalsReceived: (prevData.approvalsReceived || 0) + approvals,
                    commentsReceived: (prevData.commentsReceived || 0) + comments,
                    codeCommentsReceived: (prevData.codeCommentsReceived || 0) + codeComments,
                    generalCommentsReceived: (prevData.generalCommentsReceived || 0) + generalComments,
                    totalPRs: (prevData.totalPRs || 0) + 1,
                    prSizes,
                    prAdditions,
                    prTotalAdditions,
                    prDeletions,
                    prTotalDeletions,
                    prSize: averagePrSize,
                    prAges,
                    prTotalAge,
                    age: averagePrAge,
                    sentimentTotalScores,
                    sentimentAveragePositiveScore,
                    sentimentTotalPositiveScore,
                    sentimentAverageNegativeScore,
                    sentimentTotalNegativeScore,
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
        .sort(sortByKeys(keys))

    return sortedUsers
}

export default formatUserData