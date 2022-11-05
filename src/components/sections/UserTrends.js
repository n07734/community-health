import React from 'react'
import { connect } from 'react-redux'

import { H } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Radar from '../charts/Radar'
import formatRadarData from '../../format/radarData'
import { sortByKeys } from '../../utils'

const radialChartsContributions = ({ maxValues = {}, users = [] }, isTeamPage) => {
    const keys = [
        'commentsGiven',
        'commentsReceived',
        'uniquePRsApproved',
        'totalPRs',
    ]

    const topXUsers = isTeamPage
        ? users
        : users
            .sort(sortByKeys(keys))
            .slice(0, 6)

    const items = [
        {
            area: 'Comments received',
            dataKey: 'commentsReceived',
        },
        {
            area: 'Comments given',
            dataKey: 'commentsGiven',
        },
        {
            area: 'Approved PRs',
            dataKey: 'uniquePRsApproved',
        },
        {
            area: 'Merged PRs',
            dataKey: 'totalPRs',
        },
        {
            area: 'PR size',
            dataKey: 'prSize',
        },
    ]

    const radarData = topXUsers
        .map(user => {
            const data = items
                .map(({ area, dataKey }) => {
                    const originalUser = user[dataKey] || 0
                    const maxValue = maxValues[dataKey] || 0

                    return {
                        area,
                        value: (originalUser / maxValue) * 100,
                        valueOriginal: originalUser,
                    }
                })

            return {
                title: user.author,
                data,
                keys: ['value'],
            }
        })

    return radarData
}

const UserTrends = ({
    usersData = [],
    userIds = [],
} = {}) => {
    const radarData = formatRadarData(usersData)
    const contributionsRadar = radialChartsContributions(radarData, userIds.length > 0)

    return contributionsRadar.length > 0 && (
        <Paper>
            <ChartDescription title="Top contributor's" />
            {
                contributionsRadar
                    .map((info, i) => <Radar key={i} {...info} />)
            }
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
})

export default connect(mapStateToProps)(UserTrends)
