import _get from 'lodash/get'
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
        results: _get(data, 'data.repository.releases.edges', []),
        hasNextPage: _get(data, 'data.repository.releases.pageInfo.hasNextPage', false),
        nextArgs: {
            repo,
            org,
            nodeId: _get(data, 'data.repository.id', ''),
            cursor: _get(data, 'data.repository.releases.pageInfo.endCursor', ''),
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
        results: _get(data, 'data.repository.issues.edges', []),
        hasNextPage: _get(data, 'data.repository.issues.pageInfo.hasNextPage', false),
        nextArgs: {
            repo,
            org,
            nodeId: _get(data, 'data.repository.id', ''),
            cursor: _get(data, 'data.repository.issues.pageInfo.endCursor', ''),
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
        results: _get(data, 'data.repository.pullRequests.edges', []),
        hasNextPage: _get(data, 'data.repository.pullRequests.pageInfo.hasNextPage', false),
        nextArgs: {
            repo,
            org,
            nodeId: _get(data, 'data.repository.id', ''),
            cursor: _get(data, 'data.repository.pullRequests.pageInfo.endCursor', ''),
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
                hasNextPage: _get(data, `data.repository.${type}.pageInfo.hasNextPage`, false),
                cursor: _get(data, `data.repository.${type}.pageInfo.endCursor`, ''),
                cursorAction: actions[type],
            }))

        const hasNextPage = resultTypes
            .some(type => _get(data, `data.repository.${type}.pageInfo.hasNextPage`, false))

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
        results: _get(data, 'data.node.comments.edges', []),
        hasNextPage: _get(data, 'data.node.comments.pageInfo.hasNextPage', false),
        nextArgs: {
            nodeId: _get(data, 'data.node.id', ''),
            cursor: _get(data, 'data.node.comments.pageInfo.endCursor', ''),
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
        results: _get(data, 'data.node.reviews.edges', []),
        hasNextPage: _get(data, 'data.node.reviews.pageInfo.hasNextPage', false),
        nextArgs: {
            nodeId: _get(data, 'data.node.id', ''),
            cursor: _get(data, 'data.node.reviews.pageInfo.endCursor', ''),
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
        results: _get(data, 'data.node.comments.edges', []),
        hasNextPage: _get(data, 'data.node.comments.pageInfo.hasNextPage', false),
        nextArgs: {
            nodeId: _get(data, 'data.node.id', ''),
            cursor: _get(data, 'data.node.comments.pageInfo.endCursor', ''),
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