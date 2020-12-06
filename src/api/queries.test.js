import {
    prQuery,
    reviewCommentsQuery,
    commentsQuery,
    reviewsQuery,
    releasesQuery,
    issuesQuery,
} from './queries'

describe('queries:', () => {
    const makeRawData = ({ type = 'repository', resultType }) => {
        return {
            data: {
                [type]: {
                    id: 'ID',
                    [resultType]: {
                        edges: [1,2,3],
                        pageInfo: {
                            hasNextPage: true,
                            endCursor: 'endCursor',
                        },
                    },
                },
            },
        }
    }

    const makeStateArgs = (args) => ({
        fetches: {
            org: 'org',
            repo: 'repo',
            ...args,
        },
    })


    const testArgs = [
        {
            name: 'issuesQuery',
            testFunction: issuesQuery,
            stateArgs: {
                issuesPagination: {
                    cursor: 'cursor',
                },
            },
            rawDataArgs: {
                type: 'repository',
                resultType: 'issues',
            },
        },
        {
            name: 'releasesQuery',
            testFunction: releasesQuery,
            stateArgs: {
                releasesPagination: {
                    cursor: 'cursor',
                },
            },
            rawDataArgs: {
                type: 'repository',
                resultType: 'releases',
            },
        },
        {
            name: 'reviewsQuery',
            testFunction: reviewsQuery,
            queryArgs: {
                nodeId: 'nodeId',
                cursor: 'cursor',
            },
            rawDataArgs: {
                type: 'node',
                resultType: 'reviews',
            },
            expectFillerType: 'pullRequestReviewComments',
        },
        {
            name: 'commentsQuery',
            testFunction: commentsQuery,
            queryArgs: {
                nodeId: 'nodeId',
                cursor: 'cursor',
            },
            rawDataArgs: {
                type: 'node',
                resultType: 'comments',
            },
        },
        {
            name: 'reviewCommentsQuery',
            testFunction: reviewCommentsQuery,
            queryArgs: {
                nodeId: 'nodeId',
                cursor: 'cursor',
            },
            rawDataArgs: {
                type: 'node',
                resultType: 'comments',
            },
        },
        {
            name: 'prQuery',
            testFunction: prQuery,
            stateArgs: {
                prPagination: {
                    cursor: 'cursor',
                },
            },
            rawDataArgs: {
                type: 'repository',
                resultType: 'pullRequests',
            },
            expectFillerType: 'pullRequests',
        },
    ]

    testArgs
        .forEach(({ name, testFunction, stateArgs, queryArgs, rawDataArgs, expectFillerType }) => {
            describe(`${name}:`, () => {
                const args = stateArgs
                    ? makeStateArgs(stateArgs)
                    : queryArgs

                const {
                    query,
                    resultInfo,
                    fillerType,
                } = testFunction(args)

                it('query to match snapshot', () => {
                    expect(query).toMatchSnapshot()
                })

                it('fillerType to be corretct', () => {
                    expect(fillerType).toEqual(expectFillerType)
                })

                it('resultInfo', () => {
                    const data = makeRawData(rawDataArgs)

                    const {
                        rawData,
                        results,
                        hasNextPage,
                        nextArgs,
                    } = resultInfo(data)

                    expect(rawData).toEqual(data)
                    expect(results).toEqual([1,2,3])
                    expect(hasNextPage).toEqual(true)
                    expect(nextArgs).toEqual({
                        ...(
                            rawDataArgs.type !== 'node'
                                &&  {
                                    org: 'org',
                                    repo: 'repo',
                                }
                        ),
                        nodeId: 'ID',
                        cursor: 'endCursor',
                    })
                })
            })
        })
})
