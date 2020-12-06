import { pathOr } from 'ramda'

import types from '../state/types'

const cursorQ = (cursor, key = 'after') => cursor
    ? ` ${key}:"${cursor}" `
    : ''

const pageInfo = 'pageInfo { endCursor hasNextPage hasPreviousPage startCursor }'

const comments = (cursor) => `
    comments(first: ${cursor ? 100: 10} ${cursorQ(cursor)}) {
      edges {
        node {
          author {
            login
          }
          body
        }
      }
      ${pageInfo}
    }
`

const pullRequests = cursor => `
pullRequests(
  first: 100
  ${cursorQ(cursor)}
  states: [MERGED]
  orderBy: {field: CREATED_AT direction: DESC}
) {
  edges {
    node {
      id
      url
      author {
        login
      }
      repository {
        name
        owner {
          login
        }
      }
      additions
      deletions
      changedFiles
      mergedAt
      createdAt
      ${reviews()}
      ${comments()}
    }
  }
  ${pageInfo}
}`

const issues = cursor => `
issues(
  ${cursorQ(cursor)}
  first: 100
  orderBy: { field:CREATED_AT direction:DESC }
) {
  edges {
    node {
      title
      createdAt
      closedAt
      state
      labels(first:5) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
  ${pageInfo}
}`

const releases = cursor => `
releases(
  ${cursorQ(cursor)}
  first:100
  orderBy:{ field:CREATED_AT direction:DESC }
) {
  edges {
    node {
      id
      name
      createdAt
      tag {
        name
      }
    }
  }
  ${pageInfo}
}`

const reviews = (cursor) => `
    reviews(first: ${cursor ? 100 : 10} ${cursorQ(cursor)}) {
      edges {
        node {
          id
          state
          author {
            login
          }
          ${comments()}
        }
      }
      ${pageInfo}
    }
`

const releasesQuery = ({
    fetches: {
        token,
        org,
        repo,
        releasesPagination: {
            cursor,
            hasNextPage,
        } = {},
    } = {},
} = {}) => ({
    query: `{
        repository(name: "${repo}" owner: "${org}") {
          ${releases(cursor)}
        }
    }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'repository', 'releases', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'repository', 'releases', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            repo,
            org,
            nodeId: pathOr('', ['data', 'repository', 'id'], data),
            cursor: pathOr('', ['data', 'repository', 'releases', 'pageInfo', 'endCursor'], data),
        },
    }),
    token,
    cursorAction: types.SET_RELEASES_PAGINATION,
    hasMoreResults: hasNextPage,
})

const issuesQuery = ({
    fetches: {
        token,
        org,
        repo,
        issuesPagination: {
            cursor,
            hasNextPage,
        } = {},
    } = {},
} = {}) => ({
    query: `{
        repository(name: "${repo}" owner: "${org}") {
          ${issues(cursor)}
        }
    }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'repository', 'issues', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'repository', 'issues', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            repo,
            org,
            nodeId: pathOr('', ['data', 'repository', 'id'], data),
            cursor: pathOr('', ['data', 'repository', 'issues', 'pageInfo', 'endCursor'], data),
        },
    }),
    token,
    cursorAction: types.SET_ISSUES_PAGINATION,
    hasMoreResults: hasNextPage,
})

const prQuery = ({
    fetches: {
        token,
        org,
        repo,
        prPagination: {
            cursor,
            hasNextPage,
        },
    } = {},
}) => ({
    query: `{
          repository(name: "${repo}" owner: "${org}") {
            ${pullRequests(cursor)}
          }
      }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'repository', 'pullRequests', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'repository', 'pullRequests', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            repo,
            org,
            nodeId: pathOr('', ['data', 'repository', 'id'], data),
            cursor: pathOr('', ['data', 'repository', 'pullRequests', 'pageInfo', 'endCursor'], data),
        },
    }),
    fillerType: 'pullRequests',
    token,
    cursorAction: types.SET_PR_PAGINATION,
    hasMoreResults: hasNextPage,
})

const batchedQuery = ({
    fetches: {
        org,
        repo,
        issuesPagination: {
            cursor: issuesCursor,
            hasNextPage: issuesHasNextPage,
        } = {},
        releasesPagination: {
            cursor: releasesCursor,
            hasNextPage: releasesHasNextPage,
        } = {},
        prPagination: {
            cursor: prCursor,
            hasNextPage: prHasNextPage,
        } = {},
    },
}) => ({
    query: `{
      repository(name: "${repo}" owner: "${org}") {
        id
        description
        name
        owner {
          org: login
        }
        ${prHasNextPage ? pullRequests(prCursor) : ''}
        ${issuesHasNextPage ? issues(issuesCursor) : ''}
        ${releasesHasNextPage ? releases(releasesCursor) : ''}
      }
    }`,
    resultInfo: (data) => {
        const resultTypes = [
            'pullRequests',
            'issues',
            'releases',
        ]

        const actions = {
            pullRequests: types.SET_PR_PAGINATION,
            issues: types.SET_ISSUES_PAGINATION,
            releases: types.SET_RELEASES_PAGINATION,
        }

        const nextPageInfo = resultTypes
            .map((type) => ({
                hasNextPage: pathOr(false, ['data', 'repository', type, 'pageInfo', 'hasNextPage'], data),
                cursor: pathOr('', ['data', 'repository', type, 'pageInfo', 'endCursor'], data),
                cursorAction: actions[type],
            }))

        const hasNextPage = resultTypes
            .some(type => pathOr(false, ['data', 'repository', type, 'pageInfo', 'hasNextPage'], data))

        return {
            hasNextPage,
            nextPageInfo,
        }
    },
    fillerType: 'batchedQuery',
    hasMoreResults: [
        prHasNextPage,
        issuesHasNextPage,
        releasesHasNextPage,
    ]
        .some(Boolean),
})

const commentsQuery = ({ nodeId, cursor }) => ({
    query: `{
      node(id:"${nodeId}") {
          ... on PullRequest {
            id
            ${comments(cursor)}
          }
        }
    }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'node', 'comments', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'node', 'comments', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            nodeId: pathOr('', ['data', 'node', 'id'], data),
            cursor: pathOr('', ['data', 'node', 'comments', 'pageInfo', 'endCursor'], data),
        },
    }),
})

const reviewsQuery = ({ nodeId, cursor }) => ({
    query: `{
      node(id:"${nodeId}") {
          ... on PullRequest {
            id
            ${reviews(cursor)}
          }
        }
    }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'node', 'reviews', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'node', 'reviews', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            nodeId: pathOr('', ['data', 'node', 'id'], data),
            cursor: pathOr('', ['data', 'node', 'reviews', 'pageInfo', 'endCursor'], data),
        },
    }),
    fillerType: 'pullRequestReviewComments',
})

const reviewCommentsQuery = ({ nodeId, cursor }) => ({
    query: `{
      node(id:"${nodeId}") {
          ... on PullRequestReview {
            id
            ${comments(cursor)}
          }
        }
    }`,
    resultInfo: (data) => ({
        rawData: data,
        results: pathOr([], ['data', 'node', 'comments', 'edges'], data),
        hasNextPage: pathOr(false, ['data', 'node', 'comments', 'pageInfo', 'hasNextPage'], data),
        nextArgs: {
            nodeId: pathOr('', ['data', 'node', 'id'], data),
            cursor: pathOr('', ['data', 'node', 'comments', 'pageInfo', 'endCursor'], data),
        },
    }),
})

export {
    batchedQuery,
    prQuery,
    reviewCommentsQuery,
    commentsQuery,
    reviewsQuery,
    releasesQuery,
    issuesQuery,
}