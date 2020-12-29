import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import { H, P, UL, LI } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import Button from '../shared/Button'
import Paper from '../shared/Paper'
import { clearUser } from '../../state/actions'
import formatRadarData from '../../format/radarData'
import Radar from '../charts/Radar'
import Bar from '../charts/Bar'
import Line from '../charts/Line'

const colourA = '#1f77b4'
const colourB = '#e82573'

const userRadars = (
    {
        averagedData,
        maxValues,
        user,
    },
    userName
) => {
    const items = [
        {
            area: 'Code comments',
            dataKey: 'codeCommentsGiven',
        },
        {
            area: 'PR comments',
            dataKey: 'generalCommentsGiven',
        },
        {
            area: 'Approvals',
            dataKey: 'approvalsGiven',
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

    const getRadarData = items => items
        .map(({ area, dataKey }) => {
            const originalUser = user[dataKey] || 0
            const peersOriginal = averagedData[dataKey] || 0
            const maxValue = maxValues[dataKey] || 0

            return {
                area,
                [userName]: (originalUser / maxValue) * 100,
                peers: (peersOriginal / maxValue) * 100,
                [`${userName}Original`]: originalUser,
                peersOriginal,
            }
        })

    const radars = [
        {
            data: getRadarData(items),
            titleItems: [
                { label: userName, color: colourA },
                { label: 'Peers', color: colourB },
            ],
            keys: [userName, 'peers'],
            width: 400,
            height: 235,
        },
    ]

    return radars
}

const userBars = ({
    averagedData,
    user,
}) => {
    const averageAndUserData = [user, averagedData]

    return [
        {
            bars:[
                {
                    dataKey: 'commentsGiven',
                    color: colourA,
                    label: 'Comments given',
                },
                {
                    dataKey: 'commentsReceived',
                    color: colourB,
                    label: 'Comments received',
                },
            ],
            sortBy: '',
            data: averageAndUserData,
        },
        {
            bars: [
                {
                    dataKey: 'approvalsGiven',
                    color: colourA,
                    label: 'Approvals given',
                },
                {
                    dataKey: 'approvalsReceived',
                    color: colourB,
                    label: 'Approvals received',
                },
            ],
            sortBy: '',
            data: averageAndUserData,
        },
        {
            bars: [
                {
                    dataKey: 'totalPRs',
                    color: colourA,
                    label: 'Opened PRs',
                },
                {
                    dataKey: 'uniquePRsApproved',
                    color: colourB,
                    label: 'PRs approved',
                },
            ],
            sortBy: '',
            data: averageAndUserData,
        },
        {
            bars: [
                {
                    dataKey: 'prSize',
                    color: colourA,
                    label: 'PR size',
                },
            ],
            sortBy: '',
            data: averageAndUserData,
        },
        {
            bars: [
                {
                    dataKey: 'age',
                    color: colourB,
                    label: 'PR age',
                },
            ],
            sortBy: '',
            data: averageAndUserData,
        },
    ]
}

const userGraphs = (data = [], releases = [], userName) => {
    const mergedPrData = data
        .filter(({ mergedAt } = {}) => mergedAt)

    const peerPrData = mergedPrData
        .filter(({ author }) => author !== userName)

    const userPrData = mergedPrData
        .filter(({ author }) => author === userName)

    return [
        {
            markers: releases,
            data: [{
                lines: [
                    {
                        label: 'User comments',
                        color: colourA,
                        dataKey: 'commentsGiven',
                        data: userPrData,
                    },
                    {
                        label: 'Peer Comments',
                        color: colourB,
                        dataKey: 'commentsGiven',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }],
        },
        {
            markers: releases,
            data: [{
                lines: [
                    {
                        label: 'User PR size',
                        color: colourA,
                        dataKey: 'prSize',
                        data: userPrData,
                    },
                    {
                        label: 'Peer PR size',
                        color: colourB,
                        dataKey: 'prSize',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }],
        },
        {
            markers: releases,
            data: [{
                lines: [
                    {
                        label: 'User PR age',
                        color: colourA,
                        dataKey: 'age',
                        data: userPrData,
                    },
                    {
                        label: 'Peer PR age',
                        color: colourB,
                        dataKey: 'age',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }],
        },
    ]
}

const UserView = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    user,
    removeUser,
    classes,
} = {}) => {
    const radarData = formatRadarData(usersData, user)
    const radars = userRadars(radarData, user)
    const bars = userBars(radarData)
    const graphs = userGraphs(pullRequests, releases, user)

    return (
        <>
            <Paper>
                <ChartDescription
                    title={
                        <H level={2}>
                            <span style={{ color: colourA }}>{user}</span>
                            <Button
                                className={classes.topButton}
                                variant="outlined"
                                size="small"
                                value="Back to main view"
                                color="secondary"
                                onClick={(e) => {
                                    e.preventDefault()
                                    removeUser()
                                }} />
                        </H>
                    }
                    intro={`A collection of charts showing ${user} and average data from the top ${radarData.averagedData.userCount} peers`}
                >
                    <div>
                        <P>Reminder that context is needed, without it what looks good can be bad and what looks good can be bad</P>
                        <UL>
                            <LI>How do the given and received metrics compare?</LI>
                            <LI>How do Code comments(the how) and PR comments(the what) comaire?</LI>
                            <LI>How do PR approvals comaire?</LI>
                            <LI>How do size of PRs comaire?</LI>
                        </UL>
                    </div>
                </ChartDescription>

                {
                    radars.length
                        && (
                            <div className={classes.groupedCharts}>
                                {
                                    radars
                                        .map((info, i) => <Radar key={i} {...info} />)
                                }
                            </div>
                        )
                }
                {
                    bars.length
                        && bars
                            .map((info, i) => <Bar key={i} {...info} />)
                }
                {
                    graphs.length
                        && graphs
                            .map((info, i) => <Line key={i} {...info} />)
                }

                <Button
                    className={classes.fill}
                    variant="outlined"
                    size="small"
                    value="Back to main view"
                    color="secondary"
                    onClick={(e) => {
                        e.preventDefault()
                        removeUser()
                        window && window.scrollTo(0, 0)
                    }} />
            </Paper>
        </>
    )
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
    usersData: state.usersData,
    user: state.user,
})

const mapDispatchToProps = dispatch => ({
    removeUser: (x) => dispatch(clearUser(x)),
})

const styles = theme => ({
    'groupedCharts': {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    fill: {
        flexBasis: '100%',
    },
    topButton: {
        marginLeft: theme.mySpacing.y.large,
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserView))