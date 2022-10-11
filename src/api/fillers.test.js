import fillData from './fillers'

describe('fillData:', () => {
    it('Returns data unchanged if fillType is not recognised', async () => {
        const applyFiller = await fillData((x) => x)('nope')

        expect(applyFiller('sameOld')).toEqual('sameOld')
    })

    const getMoreReviewComments = () => ({
        data: {
            node: {
                id: 'id',
                comments: {
                    edges: ['reviewComment2'],
                    pageInfo: {
                        endCursor: 'endCursor',
                        hasNextPage: false,
                    },
                },

            },
        },
    })

    const getMoreComments = () => ({
        data: {
            node: {
                id: 'id',
                comments: {
                    edges: ['comment2'],
                    pageInfo: {
                        endCursor: 'endCursor',
                        hasNextPage: false,
                    },
                },

            },
        },
    })


    const getMoreReviews = () => ({
        data: {
            node: {
                id: 'id',
                reviews: {
                    edges: [
                        {
                            node: {
                                comments: {
                                    edges: ['reviewComment1'],
                                    pageInfo: {
                                        hasNextPage: true,
                                        endCursor: 'endCursor',
                                    },
                                },
                            },
                        },
                    ],
                    pageInfo: {
                        endCursor: 'endCursor',
                        hasNextPage: false,
                    },
                },

            },
        },
    })

    it('fillType pullRequestReviewComments adds review comments', async () => {
        const applyFiller = await fillData(getMoreReviewComments)('pullRequestReviewComments')
        const review = {
            node: {
                id: 'id',
                comments: {
                    edges: ['reviewComment1'],
                    pageInfo: {
                        endCursor: 'endCursor',
                        hasNextPage: true,
                    },
                },

            },
        }
        const result = await applyFiller([
            review,
            review,
        ])

        expect(result).toMatchSnapshot()
    })

    it('fillType pullRequests adds comments and reviews', async () => {
        const getMore = query => [
            /PullRequestReview/.test(query)
                && getMoreReviewComments(),
            /comments\(first: 100/.test(query)
                && getMoreComments(),
            /reviews\(first: 100/.test(query)
                && getMoreReviews(),
        ].find(Boolean)

        const applyFiller = await fillData(getMore)('pullRequests')
        const repo = {
            data: {
                result: {
                    pullRequests: {
                        edges: [
                            {
                                node: {
                                    id: 'id',
                                    comments: {
                                        edges: ['comment1'],
                                        pageInfo: {
                                            endCursor: 'endCursor',
                                            hasNextPage: true,
                                        },
                                    },
                                    reviews: {
                                        edges: [
                                            {
                                                node: {
                                                    comments: {
                                                        edges:['reviewComment1'],
                                                        pageInfo: {
                                                            endCursor: 'endCursor',
                                                            hasNextPage: true,
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                        pageInfo: {
                                            endCursor: 'endCursor',
                                            hasNextPage: true,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        }
        const result = await applyFiller(repo)

        expect(result).toMatchSnapshot()
    })
})