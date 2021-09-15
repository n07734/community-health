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

const pullRequests = order => cursor => `
pullRequests(
  first: 100
  ${cursorQ(cursor)}
  states: [MERGED]
  orderBy: {field: CREATED_AT direction: ${order}}
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

const issues = order => cursor => `
issues(
  ${cursorQ(cursor)}
  first: 100
  orderBy: { field:CREATED_AT direction: ${order} }
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

const releases = order => cursor => `
releases(
  ${cursorQ(cursor)}
  first:100
  orderBy:{ field:CREATED_AT direction: ${order} }
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

const batchedQuery = (order = 'DESC') => ({
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
        ${prHasNextPage ? pullRequests(order)(prCursor) : ''}
        ${issuesHasNextPage ? issues(order)(issuesCursor) : ''}
        ${releasesHasNextPage ? releases(order)(releasesCursor) : ''}
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
    reviewCommentsQuery,
    commentsQuery,
    reviewsQuery,
    issuesQuery,
}