type RawPullRequests = {
    data: {
        result: {
            pullRequests: {
                edges:[]
            }
        }
    }
}

export type Cursors = {
    endCursor: string
    startCursor?: string
    hasNextPage: boolean
}

type RawPageInfo = {
    pageInfo: Cursors
}
type RawPullRequest = {
    node: {
        id: string
        reviews: {
            edges: []
            pageInfo: Cursors
        }
        comments: {
            edges: []
            pageInfo: Cursors
        }
    }
}

type DateKeys = 'mergedAt' | 'createdAt' | 'date'

// TODO: Flesh out this type
type RawData = {
    [key: string]: any
}

// TODO: Flesh out this type
type RawItem = {
    [key: string]: any
}