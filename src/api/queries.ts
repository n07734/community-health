
import { pathOr } from 'ramda'
import { isDate } from 'date-fns'
import {
  always,
  T as alwaysTrue,
  F as alwaysFalse,
  cond,
} from 'ramda'
import { BatchedQueryArgs, CommentsQueryResult, Cursor, MakeQuery, NodeCursor, OldNew, OrgQueryResult, RawDataCommentTypeKey, RawDataTypeKey, RawPageInfo, ReviewsQueryResult, SortDirection, TeamIDsQueryResult, UntilDate, UserQueryArgs } from '../types/Querys'
import { Cursors, RawDataResult, RawDataType } from '../types/RawData'

import filterByUntilDate from '../format/filterByUntilDate'

const cursorQ = (cursor: Cursor) => cursor
  ? ` after:"${cursor}" `
  : ''

const cursorWithDirection = (order: SortDirection, { oldest, newest }: OldNew) => {
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

const getCursor = (order: SortDirection) => ({ oldest, newest }:OldNew) => {
  const cursor = order === 'DESC' ? oldest : newest
  return cursorQ(cursor)
}

const pageInfo = 'pageInfo { endCursor hasNextPage hasPreviousPage startCursor }'

const comments = (cursor: Cursor) => `
    comments(first: ${cursor ? 100 : 10} ${cursorQ(cursor)}) {
      totalCount
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

const pullRequests = (order: SortDirection) => (pagination: OldNew) => `
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
      ${reviews(undefined)}
      ${comments(undefined)}
    }
  }
  ${pageInfo}
}`

const issues = (order: SortDirection) => (pagination: OldNew) => `
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

const releases = (order: SortDirection) => (pagination: OldNew) => `
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

const reviews = (cursor: Cursor) => `
    reviews(first: ${cursor ? 100 : 10} ${cursorQ(cursor)}) {
      edges {
        node {
          id
          state
          author {
            login
            url
          }
          ${comments(undefined)}
        }
      }
      ${pageInfo}
    }
`

const getPaginationByType = (
  oldFetchInfo = {},
  untilDate = '',
  data = {},
  order: SortDirection,
) => (type: RawDataTypeKey) => {
  const {
    hasNextPage = false,
    startCursor,
    endCursor,
  } = pathOr({}, ['data', 'result', type, 'pageInfo'], data) as Cursors

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

const getPaginationByDirectionType = (oldFetchInfo = {}, untilDate = '', data = {}, order: SortDirection) => (type: RawDataCommentTypeKey) => {
  const resultPath = type === 'usersReviews'
    ? ['data', 'result']
    : ['data', 'result', type]

  const {
    hasNextPage = false,
    hasPreviousPage = false,
    startCursor,
    endCursor,
  } = pathOr({}, [...resultPath, 'pageInfo'], data) as RawPageInfo
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

  return nextInfo
}

const getPaginationForSearch = (oldFetchInfo = {}, untilDate = '', data = {}, order: SortDirection) => {
  const {
    hasNextPage = false,
    hasPreviousPage = false,
    startCursor,
    endCursor,
  } = pathOr({}, ['data', 'result', 'pageInfo'], data) as RawPageInfo
  const items = pathOr([], ['data', 'result', 'edges'], data)

  const filteredItems = isDate(untilDate)
    ? items.filter(filterByUntilDate(['node', 'mergedAt'], order, untilDate))
    : []

  const oldestDefault = order === 'DESC'
    ? endCursor
    : startCursor

  const oldestCurrent = pathOr(oldestDefault, ['usersReviewsPagination', 'oldest'], oldFetchInfo)

  const newestDefault = order === 'DESC'
    ? startCursor
    : endCursor

  const newestCurrent = pathOr(newestDefault, ['usersReviewsPagination', 'newest'], oldFetchInfo)

  const hasFollowingPage = order === 'DESC'
    ? hasNextPage
    : hasPreviousPage

  const dateFilteredLength = filteredItems.length
  const tryNextPage = cond([
    [always(hasFollowingPage === false), alwaysFalse],
    [always(!isDate(untilDate)), always(hasFollowingPage)],
    [always(dateFilteredLength === 0), alwaysFalse],
    [alwaysTrue, always(hasFollowingPage)],
  ])()

  const nextInfo = {
    newest: order === 'ASC' && startCursor ? startCursor : newestCurrent,
    oldest: order === 'DESC' && endCursor ? endCursor : oldestCurrent,
    hasNextPage: hasFollowingPage,
    hasNextPageForDate: tryNextPage,
  }

  return nextInfo
}


const getRemainingPageCount = (data: RawDataResult) => {
  const types:RawDataType[] = ['issues', 'pullRequests', 'releases']
  const [maxItems] = types
    .map((type) => data?.data?.result?.[type]?.totalCount || 0)
    .sort((a, b) => b - a)

  return Math.ceil(maxItems / 50) - 1
}

const commitComments = (order: SortDirection) => (cursor: OldNew) => `
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

const issueComments = (order: SortDirection) => (cursor: OldNew) => `
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

const reviewsByUserQuery = (untilDate: UntilDate) => ({
  user,
  sortDirection = 'DESC',
  amountOfData,
  usersReviewsPagination = {},
}: UserQueryArgs) => ({
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
            ${comments(undefined)}
            reviews(last: 10 states: [COMMENTED,APPROVED,CHANGES_REQUESTED] author: "${user}") {
              ${pageInfo}
              edges {
                node {
                  id
                  state
                  author {
                    login
                    url
                  }
                  ${comments(undefined)}
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
  resultInfo: (data:RawDataResult) => {
    const byDirectionType = getPaginationForSearch(
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
      [always(Number.isInteger(amountOfData)), always(amountOfData as number - 1)],
      [alwaysTrue, getRemainingPageCount],
    ])(data)

    const nextPageInfo = {
      // TODO: do pagination with order and cursor and first and last, also needs to take hasPreviousPage into account
      // desc: last should use oldest || endCursor and endCursor = oldest, startCursor = newest, also checks hasPreviousPage
      // asc: first should use newest || endCursor and endCursor = newest, startCursor = oldest, also checks hasNextPage
      usersReviewsPagination: Object.assign(
        byDirectionType, { hasNextPage: false },
      ),
    }

    const hasNextPageKey = isDate(untilDate) ? 'hasNextPageForDate' : 'hasNextPage'
    const pageInfo = {
      hasNextPage: nextPageInfo.usersReviewsPagination[hasNextPageKey] === true,
      nextPageInfo: {
        ...nextPageInfo,
        amountOfData: updatedAmountOfData,
      },
    }

    // Pagination via last/first and after/before is confusing
    // To go back in time from now, you need to use `last` then p2+ use `after` and the `endCursor`
    // also with this oldest is endCursor of each page and newest is the first startCursor

    // TODO: remove author prs and prs without mergedAt and prs with no user comments or approvals

    return pageInfo
  },
  fillerType: 'pullRequests',
  hasMoreResults: [
    usersReviewsPagination.hasNextPage,
  ]
    .some(x => x !== false),
})

const hasNextPage = (pagination: OldNew) => {
  const { hasNextPageForDate } = pagination
  return hasNextPageForDate !== false
}

const userQuery = (untilDate: UntilDate) => ({
  user,
  sortDirection = 'DESC',
  amountOfData,
  issuesPagination = {},
  prPagination = {},
  commitCommentsPagination = {}, // this is not review(code) comments
  issueCommentsPagination = {},
}: UserQueryArgs) => ({
  query: `{
    result: user(login: "${user}") {
      login
      ${hasNextPage(issueCommentsPagination) ? issueComments(sortDirection)(issueCommentsPagination) : ''}
      ${hasNextPage(commitCommentsPagination) ? commitComments(sortDirection)(commitCommentsPagination) : ''}
      ${hasNextPage(prPagination) ? pullRequests(sortDirection)(prPagination) : ''}
      ${issuesPagination[untilDate ? 'hasNextPageForDate' : 'hasNextPage'] !== false ? issues(sortDirection)(issuesPagination) : ''}
    }
  }`,
  sortDirection,
  user,
  resultInfo: (data:RawDataResult) => {
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
      [always(Number.isInteger(amountOfData)), always(amountOfData as number - 1)],
      [alwaysTrue, getRemainingPageCount],
    ])(data)

    Object.assign(byType('pullRequests'), { hasNextPage: false })

    const nextPageInfo = {
      prPagination: Object.assign(byType('pullRequests'), { hasNextPage: false }),
      issuesPagination: Object.assign(byType('issues'), { hasNextPage: false }),
      // TODO: do pagination with order and cursor and first and last, also needs to take hasPreviousPage into account
      // desc: last should use oldest || endCursor and endCursor = oldest, startCursor = newest, also checks hasPreviousPage
      // asc: first should use newest || endCursor and endCursor = newest, startCursor = oldest, also checks hasNextPage
      commitCommentsPagination: Object.assign(byDirectionType('commitComments'), { hasNextPage: false }),
      issueCommentsPagination: Object.assign(byDirectionType('issueComments'), { hasNextPage: false }),
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
  // TODO: fillerType ?
  hasMoreResults: [
    prPagination.hasNextPage,
    issuesPagination.hasNextPage,
    commitCommentsPagination.hasNextPage,
    issueCommentsPagination.hasNextPage,
  ]
    .some(x => x !== false),
})


const batchedQuery = (untilDate: UntilDate) => ({
  org,
  repo,
  sortDirection = 'DESC',
  amountOfData,
  issuesPagination = {},
  releasesPagination = {},
  prPagination = {},
}: BatchedQueryArgs) => ({
  query: `{
      result: repository(name: "${repo}" owner: "${org}") {
        id
        description
        name
        owner {
          org: login
        }
        ${hasNextPage(prPagination) ? pullRequests(sortDirection)(prPagination) : ''}
        ${hasNextPage(issuesPagination) ? issues(sortDirection)(issuesPagination) : ''}
        ${hasNextPage(releasesPagination) ? releases(sortDirection)(releasesPagination) : ''}
      }
    }`,
  sortDirection,
  resultInfo: (data:RawDataResult) => {
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
      [always(Number.isInteger(amountOfData)), always(amountOfData as number - 1)],
      [alwaysTrue, getRemainingPageCount],
    ])(data)

    const nextPageInfo = {
      prPagination: Object.assign({ hasNextPage: false }, byType('pullRequests')),
      issuesPagination: Object.assign({ hasNextPage: false }, byType('issues')),
      releasesPagination: Object.assign({ hasNextPage: false }, byType('releases')),
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
  fillerType: 'batchedQuery',
  hasMoreResults: [
    prPagination.hasNextPage,
    issuesPagination.hasNextPage,
    releasesPagination.hasNextPage,
  ]
    .some(x => x !== false),
})

const commentsQuery:MakeQuery = ({ nodeId, cursor }: NodeCursor) => ({
  query: `{
      node(id:"${nodeId}") {
          ... on PullRequest {
            id
            ${comments(cursor)}
          }
        }
    }`,
  resultInfo: (data: CommentsQueryResult) => ({
    rawData: data,
    results: data?.data?.node?.comments?.edges || [],
    hasNextPage: data?.data?.node?.comments?.pageInfo?.hasNextPage || false,
    nextArgs: {
      nodeId: data?.data?.node?.id || '',
      cursor: data?.data?.node?.comments?.pageInfo?.endCursor || '',
    },
  }),
  fillerType: '',
})

const reviewsQuery:MakeQuery = ({ nodeId, cursor }: NodeCursor) => ({
  query: `{
      node(id:"${nodeId}") {
          ... on PullRequest {
            id
            ${reviews(cursor)}
          }
        }
    }`,
  resultInfo: (data: ReviewsQueryResult) => ({
    rawData: data,
    results: data?.data?.node?.reviews?.edges || [],
    hasNextPage: data?.data?.node?.reviews?.pageInfo?.hasNextPage || false,
    nextArgs: {
      nodeId: data?.data?.node?.id || '',
      cursor: data?.data?.node?.reviews?.pageInfo?.endCursor || '',
    },
  }),
  fillerType: 'pullRequestReviewComments',
})

const reviewCommentsQuery:MakeQuery = ({ nodeId, cursor }: NodeCursor) => ({
  query: `{
      node(id:"${nodeId}") {
          ... on PullRequestReview {
            id
            ${comments(cursor)}
          }
        }
    }`,
  resultInfo: (data: CommentsQueryResult) => ({
    rawData: data,
    results: data?.data?.node?.comments?.edges || [],
    hasNextPage: data?.data?.node?.comments?.pageInfo?.hasNextPage || false,
    nextArgs: {
      nodeId: data?.data?.node?.id || '',
      cursor: data?.data?.node?.comments?.pageInfo?.endCursor || '',
    },
  }),
  fillerType: '',
})

const orgQuery = ({
  org,
  orgPagination = {},
}: {
  org: string
  orgPagination:Record<string, string>
}) => ({
  query: `{
    organization(login: "${org}") {
      repositories(
        first:100
        ${cursorQ(orgPagination?.cursor)}
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
  resultInfo: (data: OrgQueryResult) => {
    const hasNextPage = data?.data?.organization?.repositories?.pageInfo?.hasNextPage || false
    const cursor = data?.data?.organization?.repositories?.pageInfo?.endCursor || ''
    return ({
      rawData: data,
      results: data?.data?.organization?.repositories?.edges || [],
      hasNextPage: data?.data?.organization?.repositories?.pageInfo?.hasNextPage || false,
      nextPageInfo: {
        orgPagination: {
          cursor: cursor,
          hasNextPage,
          hasNextPageForDate: hasNextPage,
        },
        amountOfData: 'all',
      },
    })
},
})

const teamIDsQuery = ({ org, team }: { org: string, team: string }) => ({
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
  resultInfo: (data: TeamIDsQueryResult[]) => ({
    results: data[0]?.data?.organization?.team?.members?.edges || [],
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