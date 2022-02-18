import { pathOr } from 'ramda'
import format from 'date-fns/format'

const cursorQ = (cursor, key = 'after') => cursor
    ? ` ${key}:"${cursor}" `
    : ''

const getCursor = order => ({oldest, newest}) => {
 const cursor = order === 'DESC' ? oldest : newest
 return cursorQ(cursor)
}

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

const pullRequests = order => pagination => `
pullRequests(
  first: 100
  ${getCursor(order)(pagination)}
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

const issues = order => pagination => `
issues(
  ${getCursor(order)(pagination)}
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

const releases = order => pagination => `
releases(
  ${getCursor(order)(pagination)}
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

const getDateRange = (type, order, fromDate, toDate) => {
    const rangetype = /asc/i.test(order)
        ? '=<'
        : '=>'
    const range = fromDate
        ? ''
        : rangetype

    const to = toDate && format(new Date(toDate), 'yyyy-MM-dd')
    const from = fromDate
        ? `${format(new Date(fromDate), 'yyyy-MM-dd')}..`
        : ''

    return toDate
        ? `${type}:${range}${from}${to}`
        : ''
}

const searchIssues = ({
    org,
    repo,
    order,
    fromDate,
    toDate
}) => (pagination)=> `
  issues: search(
    query: "is:issue ${getDateRange('created', order, fromDate, toDate)} repo:${org}/${repo} sort:created-${/asc/i.test(order) ? 'asc' : 'desc'}"
    type: ISSUE
    first: 100
    ${getCursor(order)(pagination)}
  ) {
    issueCount
    ${pageInfo}
    edges {
      node {
        ... on Issue {
          title
          createdAt
          closedAt
          state
          labels(first:10) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`

const searchPullRequests = ({
    org,
    repo,
    order,
    fromDate,
    toDate
}) => (pagination)=> `
  pullRequests: search(
    query: "is:merged is:pr ${getDateRange('merged', order, fromDate, toDate)} repo:${org}/${repo} sort:created-${/asc/i.test(order) ? 'asc' : 'desc'}"
    type: ISSUE
    first: 100
    ${getCursor(order)(pagination)}
  ) {
    issueCount
    ${pageInfo}
    edges {
      node {
        ... on PullRequest {
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
    }
  }
`

const getPaginationByType = (oldFetchInfo, results, order) => type => {
    const {
        hasNextPage = false,
        startCursor,
        endCursor,
    } = pathOr({}, ['data', 'repository', type, 'pageInfo'], results)

    const typeStateMap = {
        pullRequests: 'prPagination',
        issues: 'issuesPagination',
        releases: 'releasesPagination',
    }

    const oldestDefault = order === 'DESC' ? endCursor : startCursor
    const oldestCurrent = pathOr(oldestDefault, [typeStateMap[type], 'oldest'], oldFetchInfo)

    const newestDefault = order === 'ASC' ? endCursor : startCursor
    const newestCurrent = pathOr(newestDefault, [typeStateMap[type], 'newest'], oldFetchInfo)

    // TODO: dont clear if undefined cursor
    return {
        newest: order === 'ASC' &&  endCursor ? endCursor : newestCurrent,
        oldest: order === 'DESC' && endCursor ? endCursor : oldestCurrent,
        hasNextPage,
    }
}

// Sort out hasNextpage as diff by order
const batchedQuery = ({
    org,
    repo,
    order = 'DESC',
    amountOfData,
    issuesPagination = {},
    releasesPagination = {},
    prPagination = {},
}) => ({
    query: `{
      repository(name: "${repo}" owner: "${org}") {
        id
        description
        name
        owner {
          org: login
        }
        ${prPagination.hasNextPage ? pullRequests(order)(prPagination) : ''}
        ${issuesPagination.hasNextPage ? issues(order)(issuesPagination) : ''}
        ${releasesPagination.hasNextPage ? releases(order)(releasesPagination) : ''}
      }
    }`,
    order,
    resultInfo: (data) => {
        const resultTypes = [
            ['prPagination', 'pullRequests'],
            ['issuesPagination', 'issues'],
            ['releasesPagination', 'releases'],
        ]

        const byType = getPaginationByType(
            {
                issuesPagination,
                releasesPagination,
                prPagination,
            },
            data,
            order
        )

        const updatedAmountOfData = Number.isInteger(amountOfData)
            ? amountOfData - 1
            : amountOfData;

        console.log('-=-=--updatedAmountOfData', updatedAmountOfData)

        const nextPageInfo = resultTypes
            .reduce((acc,[key, type]) => ({
                ...acc,
                [key] : byType(type)
            }), {})

        return {
            hasNextPage: Object.values(nextPageInfo).some(({ hasNextPage } ) => hasNextPage !== false),
            nextPageInfo: {
              ...nextPageInfo,
              amountOfData: updatedAmountOfData,
            },
        }
    },
    fillerType: 'batchedQuery',
    hasMoreResults: [
        prPagination.hasNextPage,
        issuesPagination.hasNextPage,
        releasesPagination.hasNextPage,
    ]
        .some(x => x !== false),
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
    searchIssues,
    searchPullRequests,
}