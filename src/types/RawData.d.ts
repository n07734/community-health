export type RawPullRequests = {
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

export type RawPageInfo = {
    pageInfo: Cursors
}
export type RawPullRequest = {
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

export type DateKeys = 'mergedAt' | 'createdAt' | 'date'

// TODO: Flesh out this type
export type RawData = {
    [key: string]: any
}

// TODO: Flesh out this type
export type RawItem = {
    [key: string]: any
}