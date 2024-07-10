import {
    reviewCommentsQuery,
    commentsQuery,
    reviewsQuery,
} from './queries'

describe('queries:', () => {
    const makeRawData = ({ type = 'repository', resultType = '' }) => {
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

    const makeStateArgs = (args:any) => ({
        fetches: {
            org: 'org',
            repo: 'repo',
            ...args,
        },
    })


    const testArgs = [
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
            expectFillerType: '',
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
            expectFillerType: '',
        },
    ]

    testArgs
        .forEach(({
            name,
            testFunction,
            stateArgs,
            queryArgs,
            rawDataArgs,
            expectFillerType,
        }: any) => {
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

                it('fillerType to be correct', () => {
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
