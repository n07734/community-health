import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import { P } from './shared/StyledTags'
import Button from './shared/Button'
import Paper from './shared/Paper'
import Line from './charts/Line'
import StatBars from './charts/StatBars'
import ItemsTable from './sections/ItemsTable'
import { chunkData } from './charts/lineHelpers'

import { colors } from './colors'
import { clearUser } from '../state/actions'
import usersAverageData from '../format/usersAverageData'

const colourA = '#1f77b4'
const colourB = '#e82573'

const userGraphs = (pullRequests = [], releases = [], userName) => {
    const peerPrData = []
    const userPrData = []
    pullRequests
    .forEach((item = {}) => {
        const author = item.author
        if (author === userName) {
            userPrData.push(item)
        } else {
            peerPrData.push(item)
        }
    })

    const chunkyData = chunkData(userPrData)

    return [
        [
            {
                dataKeys:['commentSentimentScore', 'commentAuthorSentimentScore'],
                data: chunkyData,
            },
            {
                markers: releases,
                showLegends: true,
                title: 'Sentiments in PR',
                data: [{
                    lines: [
                        {
                            label: `${userName} received`,
                            color: colors[2],
                            dataKey: 'commentSentimentScore',
                            data: userPrData,
                        },
                        {
                            label: `${userName} given`,
                            color: colors[1],
                            dataKey: 'commentAuthorSentimentScore',
                            data: userPrData,
                        },
                        {
                            label: 'Peer received',
                            color: colors[4],
                            dataKey: 'commentSentimentScore',
                            data: peerPrData,
                        },
                        {
                            label: 'Peer given',
                            color: colors[5],
                            dataKey: 'commentAuthorSentimentScore',
                            data: peerPrData,
                        },
                    ],
                    xAxis: 'left',
                }],
            },
        ],
        [
            {
                dataKeys:['prSize'],
                data: chunkyData,
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
        ],
        [
            {
                dataKeys:['age'],
                data: chunkyData,
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
        ],
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
    const graphs = userGraphs(pullRequests, releases, user)
    const [userData, averagedData] = usersAverageData(usersData, user)

    return (
        <Paper>
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

            <P className={classes.copy}>A collection metrics showing {user}'s data and average data from the top {averagedData.userCount} peers</P>

            <StatBars user1={userData} user2={averagedData} />
            {
                graphs.length
                    && graphs
                        .map(([itemsInfo, lineInfo], i) => <>
                            <Line key={i} {...lineInfo} />
                            <ItemsTable key={i + graphs.length} {...itemsInfo} />
                        </>)
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
    copy: {
        flexBasis: '100%',
        textAlign: 'center',
    },
    topButton: {
        marginLeft: theme.mySpacing.y.large,
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserView))