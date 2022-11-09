import React from 'react'
import { connect } from 'react-redux'

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Radar from '../charts/Radar'
import Button from '../shared/Button'
import formatRadarData from '../../format/radarData'
import { sortByKeys } from '../../utils'

import {
    setUser as setUserAction,
} from '../../state/actions'

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
    setUser = () => {},
} = {}) => {
    const radarData = formatRadarData(usersData)
    const contributionsRadar = radialChartsContributions(radarData, userIds.length > 0)

    const title = userIds.length > 0
        ? 'Team members'
        : 'Top contributors'

    return contributionsRadar.length > 0 && (
        <Paper>
            <ChartDescription title={title} />
            {
                contributionsRadar
                    .map((info = {}, i) => <div key={i} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <Radar
                            showTitle={false}
                            height={240}
                            colors={[
                                (i + 1) % 2 === 0
                                    ? '#1f77b4'
                                    : '#e82573'
                            ]}
                            {...info}
                        />
                        <Button
                            value={info.title}
                            color={
                                (i + 1) % 2 === 0
                                    ? 'secondary'
                                    : 'primary'
                            }
                            onClick={(e) => {
                                e.preventDefault()
                                setUser(e.currentTarget.value)
                                window && window.scrollTo(0, 0)
                            }}
                        />
                    </div>)
            }
        </Paper>
    )
}

const mapDispatchToProps = dispatch => ({
    setUser: (x) => dispatch(setUserAction(x)),
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
})

export default connect(mapStateToProps, mapDispatchToProps)(UserTrends)
