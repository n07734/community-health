import { pathOr } from 'ramda'
import { isDate } from 'date-fns'
import {
  always,
  T as alwaysTrue,
  F as alwaysFalse,
  cond,
} from 'ramda'
import filterByUntilDate from '../format/filterByUntilDate'

const cursorQ = (cursor) => cursor
    ? ` after:"${cursor}" `
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
            url
          }
          body
        }
      }
      ${pageInfo}
    }
`

const pullRequests = order => pagination => `
pullRequests(
  first: 50
  ${getCursor(order)(pagination)}
  states: [MERGED]
  orderBy: {field: CREATED_AT direction: ${order}}
) {
  totalCount
  edges {
    node {
      id
      url
      author {
        login
        url
      }
      repository {
        name
        owner {
          login
        }
      }
      additions
      deletions
      mergedAt
      createdAt
      commits(first:1) {
        edges {
          node {
            commit {
              committedDate
            }
          }
        }
      }
      ${reviews()}
      ${comments()}
    }
  }
  ${pageInfo}
}`

const issues = order => pagination => `
issues(
  ${getCursor(order)(pagination)}
  first: 50
  orderBy: { field:CREATED_AT direction: ${order} }
) {
  totalCount
  edges {
    node {
      title
      url
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
  first: 50
  orderBy:{ field:CREATED_AT direction: ${order} }
) {
  totalCount
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
            url
          }
          ${comments()}
        }
      }
      ${pageInfo}
    }
`

const getPaginationByType = (oldFetchInfo = {}, untilDate ='', data = {}, order) => type => {
    const {
        hasNextPage = false,
        startCursor,
        endCursor,
    } = pathOr({}, ['data', 'result', type, 'pageInfo'], data)

    const items = pathOr([], ['data', 'result', type, 'edges'], data)

    const dateKey = type === 'pullRequests'
      ? 'mergedAt'
      : 'createdAt'

    const filteredItems = isDate(untilDate)
      ? items.filter(filterByUntilDate(['node', dateKey], order, untilDate))
      : []

    const typeStateMap = {
        pullRequests: 'prPagination',
        issues: 'issuesPagination',
        releases: 'releasesPagination',
    }

    const oldestDefault = order === 'DESC' ? endCursor : startCursor
    const oldestCurrent = pathOr(oldestDefault, [typeStateMap[type], 'oldest'], oldFetchInfo)

    const newestDefault = order === 'ASC' ? endCursor : startCursor
    const newestCurrent = pathOr(newestDefault, [typeStateMap[type], 'newest'], oldFetchInfo)

    // TODO: Don't clear if undefined cursor
    // TODO: add hasPrevPage
    const dateFilteredLength = filteredItems.length
    const tryNextPage = cond([
      [always(hasNextPage === false), alwaysFalse],
      [always(!isDate(untilDate)), always(hasNextPage)],
      [always(dateFilteredLength === 0), alwaysFalse],
      [always(dateFilteredLength > 0 && items.length > dateFilteredLength), alwaysFalse],
      [alwaysTrue, always(hasNextPage)],
    ])()

    return {
        newest: order === 'ASC' &&  endCursor ? endCursor : newestCurrent,
        oldest: order === 'DESC' && endCursor ? endCursor : oldestCurrent,
        hasNextPage,
        hasNextPageForDate: tryNextPage,
    }
}

const getRemainingPageCount = (data) => {
  const [ maxItems ] = ['issues', 'pullRequests', 'releases']
    .map(type => pathOr(0, ['data', 'result', type, 'totalCount'], data))
    .sort((a,b) => a > b)

    return Math.ceil(maxItems/50) -1
}

const userQuery = (untilDate) => ({
  user,
  sortDirection = 'DESC',
  amountOfData,
  issuesPagination = {},
  prPagination = {},
}) => ({
  query: `{
    result: user(login: "${user}") {
      login
      ${prPagination[untilDate ? 'hasNextPageForDate' : ' '] !== false ? pullRequests(sortDirection)(prPagination) : ''}
      ${issuesPagination[untilDate ? 'hasNextPageForDate' : 'hasNextPage'] !== false ? issues(sortDirection)(issuesPagination) : ''}
    }
  }`,
  sortDirection,
  user,
  resultInfo: (data) => {
      const byType = getPaginationByType(
          {
              issuesPagination,
              prPagination,
              amountOfData,
          },
          untilDate,
          data,
          sortDirection,
      )

      const updatedAmountOfData = cond([
        [always(amountOfData === 'all'), always(amountOfData)],
        [always(isDate(untilDate)), always(amountOfData)],
        [always(Number.isInteger(amountOfData)), always(amountOfData - 1)],
        [alwaysTrue, getRemainingPageCount],
      ])(data)

      const nextPageInfo = {
        prPagination: {
          hasNextPage: false,
          ...byType('pullRequests'),
        },
        issuesPagination: {
          hasNextPage: false,
          ...byType('issues'),
        },
      }

      const hasNextPageKey = isDate(untilDate) ? 'hasNextPageForDate' : 'hasNextPage'
      return  {
          hasNextPage: Object.values(nextPageInfo).some(x => x[hasNextPageKey] === true),
          nextPageInfo: {
            ...nextPageInfo,
            amountOfData: updatedAmountOfData,
          },
      }
  },
  hasMoreResults: [
      prPagination.hasNextPage,
      issuesPagination.hasNextPage,
  ]
      .some(x => x !== false),
})

const batchedQuery = (untilDate) => ({
    org,
    repo,
    sortDirection = 'DESC',
    amountOfData,
    issuesPagination = {},
    releasesPagination = {},
    prPagination = {},
}) => ({
    query: `{
      result: repository(name: "${repo}" owner: "${org}") {
        id
        description
        name
        owner {
          org: login
        }
        ${prPagination[untilDate ? 'hasNextPageForDate' : 'hasNextPage'] !== false ? pullRequests(sortDirection)(prPagination) : ''}
        ${issuesPagination[untilDate ? 'hasNextPageForDate' : 'hasNextPage'] !== false ? issues(sortDirection)(issuesPagination) : ''}
        ${releasesPagination[untilDate ? 'hasNextPageForDate' : 'hasNextPage'] !== false ? releases(sortDirection)(releasesPagination) : ''}
      }
    }`,
    sortDirection,
    resultInfo: (data) => {
        const byType = getPaginationByType(
            {
                issuesPagination,
                releasesPagination,
                prPagination,
            },
            untilDate,
            data,
            sortDirection,
        )

        const updatedAmountOfData = cond([
          [always(amountOfData === 'all'), always(amountOfData)],
          [always(isDate(untilDate)), always(amountOfData)],
          [always(Number.isInteger(amountOfData)), always(amountOfData - 1)],
          [alwaysTrue, getRemainingPageCount],
        ])(data)

        const nextPageInfo = {
          prPagination: {
            hasNextPage: false,
            ...byType('pullRequests'),
          },
          issuesPagination: {
            hasNextPage: false,
            ...byType('issues'),
          },
          releasesPagination: {
            hasNextPage: false,
            ...byType('releases'),
          },
        }

        const hasNextPageKey = isDate(untilDate) ? 'hasNextPageForDate' : 'hasNextPage'
        return {
            hasNextPage: Object.values(nextPageInfo).some(x => x[hasNextPageKey] === true),
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

const orgQuery = ({ org, cursor }) => ({
  query: `{
    organization(login: "${org}") {
      repositories(
        first:100
        ${cursorQ(cursor)}
        orderBy: {field: NAME, direction: ASC}
      ) {
        edges {
          node {
            name
          }
          cursor
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }`,
  fillerType: 'org',
  resultInfo: (data) => ({
    rawData: data,
    results: pathOr([], ['data', 'organization', 'repositories', 'edges'], data),
    hasNextPage: pathOr(false, ['data', 'organization', 'repositories', 'pageInfo', 'hasNextPage'], data),
    nextArgs: {
        nodeId: pathOr('', ['data', 'organization', 'id'], data),
        cursor: pathOr('', ['data', 'organization', 'repositories', 'pageInfo', 'endCursor'], data),
    },
  }),
})

const teamIDsQuery = ({ org, team }) => ({
  query: `{
    organization(login: "${org}") {
      team(slug:"${team}") {
        members(
          first:100
        ) {
          edges {
            node {
              name
              email
              login
              createdAt
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }`,
  fillerType: 'team',
  resultInfo: (data) => ({
    results: pathOr([], ['data', 'organization', 'team', 'members', 'edges'], data[0]),
    hasNextPage: false,
}),
})

export {
    batchedQuery,
    commentsQuery,
    orgQuery,
    userQuery,
    reviewCommentsQuery,
    reviewsQuery,
    teamIDsQuery,
}