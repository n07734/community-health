
import {  pick } from 'ramda'
import { sortByKeys } from '../utils'
import { AnyObject, ObjNumbers } from '../types/Components'
import { UserData, UserDataNumbersKeys } from '../types/State'
import { PullRequest } from '../types/FormattedData'

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
    prSizes: [],
    prTotalAdditions: 0,
    prTotalDeletions: 0,
    prAdditions: [],
    prDeletions: [],
    prAges: [],
    sentimentTotalScores: [],
    orgs: new Set(),
    repos: new Set(),
    sentimentTotalPositiveScore: 0,
    sentimentAveragePositiveScore: 0,
    sentimentPositiveCount: 0,
    sentimentTotalNegativeScore: 0,
    sentimentNegativeCount: 0,
    sentimentAverageNegativeScore: 0,
}

const updateContributorCount = (
    currentData: any,
    objKey: string,
    obj: ObjNumbers,
    addition?: number,
) => {
    const contributorCount: AnyObject = {}
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

const updateByUsersCount = (
    currentData: any,
    objKey: string,
    obj: ObjNumbers,
    author: string,
    increment: number,
    onlyUserId: string,
) => {
    const byUsersCount: any = {}
    Object.entries(obj)
        .filter(([key]) => onlyUserId && author !== onlyUserId ? key === onlyUserId : true)
        .forEach(([key, value]) => {
            const currentUserData = currentData[key] || {}
            const currentKeyData = currentUserData[objKey] || {}
            const updatedKeyData = {
                ...currentKeyData,
                [author]: (currentKeyData[author] || 0) + (increment || value || 0),
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

// TODO: Refactor this function to be more readable
const formatUserData = (data: PullRequest[] = [], usersInfo: AnyObject = {}, onlyUserId = '') => {
    const authors = new Set()
    const userData: AnyObject = {}
    data
        .forEach((prData) => {
            const {
                org,
                repo,
                author,
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

            authors.add(author)

            const updatedCommentsByUser = updateByUsersCount(userData, 'commentsByUser', commenters, author, 0, onlyUserId)
            Object.assign(userData, updatedCommentsByUser)

            const updatedApprovalsByUser = updateByUsersCount(userData, 'approvalsByUser', approvers, author, 1, onlyUserId)
            Object.assign(userData, updatedApprovalsByUser)

            const updatedCommentsGiven = updateContributorCount(userData, 'commentsGiven', commenters)
            Object.assign(userData, updatedCommentsGiven)

            const updatedCodeCommentsGiven = updateContributorCount(userData, 'codeCommentsGiven', codeCommenters)
            Object.assign(userData, updatedCodeCommentsGiven)

            const updatedGeneralCommentsGiven = updateContributorCount(userData, 'generalCommentsGiven', generalCommenters)
            Object.assign(userData, updatedGeneralCommentsGiven)

            const updatedApprovalsGiven = updateContributorCount(userData, 'approvalsGiven', approvers)
            Object.assign(userData, updatedApprovalsGiven)

            const updatedUniquePRsApproved = updateContributorCount(userData, 'uniquePRsApproved', approvers, 1)
            Object.assign(userData, updatedUniquePRsApproved)

            const contrtibutors = [...new Set([
                ...Object.keys(codeCommenters),
                ...Object.keys(generalCommenters),
                ...Object.keys(approvers),
            ])]

            contrtibutors
                .forEach((key) => {
                    const prevData = userData[key] || {}
                    const updated = {
                        ...baseUserData,
                        ...prevData,
                        author: key,
                        uniquePRsContributedTo: (prevData.uniquePRsContributedTo || 0) + 1,
                    }

                    userData[key] = updated
                })

            if (!userData[author]) {
                userData[author] = {
                    ...baseUserData,
                }
            }

            userData[author].orgs.add(org)
            userData[author].repos.add(repo)

            const sentimentTotal = commentSentimentTotalScore || (commentSentimentScore + commentAuthorSentimentScore)
            userData[author].sentimentTotalScores.push(sentimentTotal)

            const addPRsValue = (key = '', addValue = 0) =>
                (userData[author][key] || 0) + addValue

            const totalPRs = addPRsValue('totalPRs', 1)
            const prTotalAge = addPRsValue('prTotalAge', age)
            const averagePrAge = Math.round(prTotalAge /totalPRs)

            const prTotalAdditions = addPRsValue('prTotalAdditions', additions)
            const prTotalDeletions = addPRsValue('prTotalDeletions', deletions)

            const prSize = Math.round((prTotalAdditions + prTotalDeletions) / totalPRs)

            const sentimentTotalPositiveScoreValue = sentimentTotal > 0
                ? sentimentTotal
                : 0

            const sentimentPositiveIncrement = sentimentTotal > 0
                ? 1
                : 0

            const sentimentTotalPositiveScore = addPRsValue('sentimentTotalPositiveScore', sentimentTotalPositiveScoreValue)
            const sentimentPositiveCount = addPRsValue('sentimentPositiveCount', sentimentPositiveIncrement)
            const sentimentAveragePositiveScore = sentimentPositiveCount
                ? Math.round(sentimentTotalPositiveScore / sentimentPositiveCount)
                : 0

            const sentimentTotalNegativeScoreValue = sentimentTotal < 0
                ? sentimentTotal
                : 0

            const sentimentNegativeIncrement = sentimentTotal < 0
                ? 1
                : 0

            const sentimentNegativeCount = addPRsValue('sentimentNegativeCount', sentimentNegativeIncrement)
            const sentimentTotalNegativeScore = addPRsValue('sentimentTotalNegativeScore', sentimentTotalNegativeScoreValue)
            const sentimentAverageNegativeScore = sentimentNegativeCount
                ? Math.round(sentimentTotalNegativeScore / sentimentNegativeCount)
                : 0

            const moreData = {
                author,
                name: usersInfo[author]?.name || author,
                user: author,
                totalPRs,
                age: averagePrAge,
                prTotalAge,
                prSize,
                prTotalAdditions,
                prTotalDeletions,
                approvalsReceived: addPRsValue('approvalsReceived', approvals),
                commentsReceived: addPRsValue('commentsReceived', comments),
                codeCommentsReceived: addPRsValue('codeCommentsReceived', codeComments),
                generalCommentsReceived: addPRsValue('generalCommentsReceived', generalComments),
                commentSentimentTotalScore: addPRsValue('commentSentimentTotalScore', sentimentTotal),
                sentimentPositiveCount,
                sentimentTotalPositiveScore,
                sentimentAveragePositiveScore,
                sentimentNegativeCount,
                sentimentTotalNegativeScore,
                sentimentAverageNegativeScore,

                orgCount: userData[author].orgs.size,
                repoCount: userData[author].repos.size,
            }

            Object.assign(userData[author], moreData)
        })

    const newUsersData:UserData[] = Object.values(userData)
        .filter(({ author }) => authors.has(author))
        .map((user = {}) => {
            const picked = pick([
                'author',
                'user',
                'name',
                'approvalsGiven',
                'approvalsByUser',
                'uniquePRsApproved',
                'commentsGiven',
                'commentsReceived',
                'codeCommentsGiven',
                'codeCommentsReceived',
                'generalCommentsGiven',
                'generalCommentsReceived',
                'totalPRs',
                'uniquePRsContributedTo',
                'commentsByUser',
                'prTotalAdditions',
                'prTotalDeletions',
                'orgCount',
                'repoCount',
                'user',
                'approvalsReceived',
                'prSize',
                'prTotalAge',
                'age',
                'sentimentAveragePositiveScore',
                'sentimentTotalPositiveScore',
                'sentimentAverageNegativeScore',
                'sentimentTotalNegativeScore',
            ], user)

            return picked
        })

    const keys:UserDataNumbersKeys[] = [
        'commentsGiven',
        'commentsReceived',
        'approvalsGiven',
        'approvalsReceived',
    ]

    const sortedUsers = newUsersData
        .filter(({ author }) => Object.keys(usersInfo).length > 0 ? usersInfo[author] : true)
        .sort(sortByKeys(keys))

    return sortedUsers
}

export default formatUserData
