/* eslint-disable no-unused-vars */
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

const cursorWithDirection = (order, { oldest, newest }) => {
  const cursor = order === 'DESC' ? oldest : newest
  const orderCursor = order === 'DESC' ? 'after' : 'before'
  const cursorString = cursor
    ? ` ${orderCursor}:"${cursor}" `
    : ''

  const pageCount = cursorString
    ? 100
    : 10

  const amountString = order === 'DESC'
    ? `last: ${pageCount}`
    : `first: ${pageCount}`

  return `
    ${amountString}
    ${cursorString}
  `
}

const getCursor = order => ({ oldest, newest }) => {
  const cursor = order === 'DESC' ? oldest : newest
  return cursorQ(cursor)
}

const pageInfo = 'pageInfo { endCursor hasNextPage hasPreviousPage startCursor }'

const comments = (cursor) => `
    comments(first: ${cursor ? 100 : 10} ${cursorQ(cursor)}) {
      edges {
        node {
          author {
            login
            url
          }
          publishedAt
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

const getPaginationByType = (oldFetchInfo = {}, untilDate = '', data = {}, order) => type => {
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
    newest: order === 'ASC' && endCursor ? endCursor : newestCurrent,
    oldest: order === 'DESC' && endCursor ? endCursor : oldestCurrent,
    hasNextPage,
    hasNextPageForDate: tryNextPage,
  }
}

const getPaginationByDirectionType = (oldFetchInfo = {}, untilDate = '', data = {}, order) => type => {
  const resultPath = type === 'usersReviews'
    ? ['data', 'result']
    : ['data', 'result', type]
  const {
    hasNextPage = false,
    hasPreviousPage = false,
    startCursor,
    endCursor,
  } = pathOr({}, [...resultPath, 'pageInfo'], data)
  console.log('hasNextPage:', hasNextPage);
  console.log('hasPreviousPage:', hasPreviousPage);
  console.log('startCursor:', startCursor);
  console.log('endCursor:', endCursor);
  const items = pathOr([], [...resultPath, 'edges'], data)

  const dateKey = ['pullRequests', 'usersReviews'].includes(type)
    ? 'mergedAt'
    : 'createdAt'

  const filteredItems = isDate(untilDate)
    ? items.filter(filterByUntilDate(['node', dateKey], order, untilDate))
    : []

  const typeStateMap = {
    commitComments: 'commitCommentsPagination',
    issueComments: 'issueCommentsPagination',
    usersReviews: 'usersReviewsPagination',
  }

  const direction = type === 'usersReviews' || order === 'ASC'
    ? 'right'
    : 'left'

  const oldestDefault = direction === 'right'
    ? endCursor
    : startCursor

  const oldestCurrent = pathOr(oldestDefault, [typeStateMap[type], 'oldest'], oldFetchInfo)

  const newestDefault = direction === 'right'
    ? startCursor
    : endCursor

  const newestCurrent = pathOr(newestDefault, [typeStateMap[type], 'newest'], oldFetchInfo)

  const hasFollowingPage = direction === 'right'
    ? hasNextPage
    : hasPreviousPage

  // TODO: Don't clear if undefined cursor
  // TODO: add hasPrevPage
  const dateFilteredLength = filteredItems.length
  const tryNextPage = cond([
    [always(hasFollowingPage === false), alwaysFalse],
    [always(!isDate(untilDate)), always(hasFollowingPage)],
    [always(dateFilteredLength === 0), alwaysFalse],
    [always(dateFilteredLength > 0 && items.length > dateFilteredLength), alwaysFalse],
    [alwaysTrue, always(hasFollowingPage)],
  ])()

  const nextInfo = {
    newest: direction === 'right' && endCursor ? endCursor : newestCurrent,
    oldest: direction === 'left' && startCursor ? startCursor : oldestCurrent,
    hasNextPage: hasFollowingPage,
    hasNextPageForDate: tryNextPage,
  }

  console.log('nextInfo', nextInfo)
  return nextInfo
}

const getRemainingPageCount = (data) => {
  const [maxItems] = ['issues', 'pullRequests', 'releases']
    .map(type => pathOr(0, ['data', 'result', type, 'totalCount'], data))
    .sort((a, b) => a > b)

  return Math.ceil(maxItems / 50) - 1
}

const commitComments = (order) => (cursor) => `
    commitComments(
      ${cursorWithDirection(order, cursor)}
    ) {
      edges {
        cursor
        node {
          createdAt
          commit {
            repository {
              nameWithOwner
            }
            url
            associatedPullRequests(last: 10) {
              edges {
                node {
                  number
                  url
                }
              }
            }
          }
          body
        }
      }
      ${pageInfo}
    }
`

const issueComments = (order) => (cursor) => `
    issueComments(
      ${cursorWithDirection(order, cursor)}
    ) {
      edges {
        cursor
        node {
          createdAt
          url
          repository {
            nameWithOwner
          }
          issue {
            number
          }
          pullRequest {
            number
          }
          body
        }
      }
      ${pageInfo}
    }
`
// TODO: Get pagination working, then nested pagination
// last first with before and after, what is the order when there is no
const reviewsByUserQuery = (untilDate) => ({
  user,
  sortDirection = 'DESC',
  amountOfData,
  usersReviewsPagination = {},
}) => ({
  query: `{
    result: search(
      query: "type:pr state:closed reviewed-by:${user}"
      type: ISSUE
      ${cursorWithDirection(sortDirection, usersReviewsPagination)}
    ) {
      issueCount
      ${pageInfo}
      edges {
        node {
          ... on PullRequest {
            id
            number
            url
            mergedAt
            createdAt
            ${comments()}
            reviews(last: 10 states: [COMMENTED,APPROVED,CHANGES_REQUESTED] author: "${user}") {
              totalCount
              ${pageInfo}
              edges {
                node {
                  id
                  ${comments()}
                }
              }
            }
          }
        }
      }
    }
  }`,
  sortDirection,
  user,
  resultInfo: (data) => {
    console.log('==resultInfo data', data)

    const byDirectionType = getPaginationByDirectionType(
      {
        usersReviewsPagination,
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
      // TODO: do pagination with order and cursor and first and last, also needs to take hasPreviousPage into account
      // desc: last should use oldest || endCursor and endCursor = oldest, startCursor = newest, also checks hasPreviousPage
      // asc: first should use newest || endCursor and endCursor = newest, startCursor = oldest, also checks hasNextPage
      usersReviewsPagination: {
        hasNextPage: false,
        ...byDirectionType('usersReviews'),
      },
    }

    const hasNextPageKey = isDate(untilDate) ? 'hasNextPageForDate' : 'hasNextPage'
    const pageInfo = {
      hasNextPage: Object.values(nextPageInfo).some(x => x[hasNextPageKey] === true),
      nextPageInfo: {
        ...nextPageInfo,
        amountOfData: updatedAmountOfData,
      },
    }
    console.log('usersReviewsPagination', pageInfo)
    return pageInfo
  },
  hasMoreResults: [
    usersReviewsPagination.hasNextPage,
  ]
    .some(x => x !== false),
})

const userQuery = (untilDate) => ({
  user,
  sortDirection = 'DESC',
  amountOfData,
  issuesPagination = {},
  prPagination = {},
  commitCommentsPagination = {}, // this is not review(code) comments
  issueCommentsPagination = {},
}) => ({
  query: `{
    result: user(login: "${user}") {
      login
      ${issueCommentsPagination[untilDate ? 'hasNextPageForDate' : ' '] !== false ? issueComments(sortDirection)(issueCommentsPagination) : ''}
      ${commitCommentsPagination[untilDate ? 'hasNextPageForDate' : ' '] !== false ? commitComments(sortDirection)(commitCommentsPagination) : ''}
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

    const byDirectionType = getPaginationByDirectionType(
      {
        commitCommentsPagination,
        issueCommentsPagination,
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
      // TODO: do pagination with order and cursor and first and last, also needs to take hasPreviousPage into account
      // desc: last should use oldest || endCursor and endCursor = oldest, startCursor = newest, also checks hasPreviousPage
      // asc: first should use newest || endCursor and endCursor = newest, startCursor = oldest, also checks hasNextPage
      commitCommentsPagination: {
        hasNextPage: false,
        ...byDirectionType('commitComments'),
      },
      issueCommentsPagination: {
        hasNextPage: false,
        ...byDirectionType('issueComments'),
      },
    }

    const hasNextPageKey = isDate(untilDate) ? 'hasNextPageForDate' : 'hasNextPage'
    const pageInfo = {
      hasNextPage: Object.values(nextPageInfo).some(x => x[hasNextPageKey] === true),
      nextPageInfo: {
        ...nextPageInfo,
        amountOfData: updatedAmountOfData,
      },
    }

    return pageInfo
  },
  hasMoreResults: [
    prPagination.hasNextPage,
    issuesPagination.hasNextPage,
    commitCommentsPagination.hasNextPage,
    issueCommentsPagination.hasNextPage,
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
  reviewsByUserQuery,
  reviewsQuery,
  teamIDsQuery,
}