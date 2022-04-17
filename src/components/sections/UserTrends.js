import React from 'react'
import { connect } from 'react-redux'

import { H } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Radar from '../charts/Radar'
import formatRadarData from '../../format/radarData'

const radialChartsContributions = ({ maxValues = {}, users = [] }) => {
    const keys = [
        'commentsGiven',
        'commentsReceived',
        'approvalsGiven',
        'approvalsReceived',
    ]

    const topXUsers = users
        .sort((a, b) => {
            const aTotal = keys
                .reduce((acc, key) => acc + (a[key] || 0), 0)

            const bTotal = keys
                .reduce((acc, key) => acc + (b[key] || 0), 0)
            return bTotal - aTotal
        })
        .slice(0, 6)

    const items = [
        {
            area: 'Code comments',
            given: 'codeCommentsGiven',
            received: 'codeCommentsReceived',
        },
        {
            area: 'PR comments',
            given: 'generalCommentsGiven',
            received: 'generalCommentsReceived',
        },
        {
            area: 'Approvals',
            given: 'approvalsGiven',
            received: 'approvalsReceived',
        },
    ]

    const radarData = topXUsers
        .map(user => {
            const data = items
                .map(({ area, given, received}) => {
                    const givenOriginal = user[given] || 0
                    const receivedOriginal = user[received] || 0

                    return {
                        area,
                        given: givenOriginal
                            ? (givenOriginal / (maxValues[given] || 0)) * 100
                            : 0,
                        received: receivedOriginal
                            ? (receivedOriginal / (maxValues[received] || 0)) * 100
                            : 0,
                        givenOriginal,
                        receivedOriginal,
                    }
                })

            return {
                title: user.author,
                data,
                keys: ['given', 'received'],
            }
        })

    return radarData
}

const UserTrends = ({
    usersData = [],
} = {}) => {
    const radarData = formatRadarData(usersData)
    // const prRadars = radialChartsPRs(radarData)
    const contributionsRadar = radialChartsContributions(radarData)

    return (
        <Paper>
            <ChartDescription
                title={(
                    <>
                        <H level={2}>User's contributions</H>
                        <H level={3}>Comments and approvals, <span style={{ color: '#1f77b4' }}>given</span> and <span style={{ color:'#e82573'}}>received</span></H>
                    </>
                )}
                intro="This section shows how given and received metrics compare for the top contributors."
            >
            </ChartDescription>
            {
                contributionsRadar.length > 0
                    && contributionsRadar
                        .map((info, i) => <Radar key={i} {...info} />)
            }
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    usersData: state.usersData,
})

export default connect(mapStateToProps)(UserTrends)
