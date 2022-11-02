import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import {
    Select,
    MenuItem,
} from '@material-ui/core'
import { pathOr } from 'ramda'

import { P } from './shared/StyledTags'
import Button from './shared/Button'
import Paper from './shared/Paper'
import Line from './charts/Line'
import ItemsTable from './sections/ItemsTable'
import { chunkData } from './charts/lineHelpers'
import PullRequestCustom from './sections/PullRequestCustom'

import {
    colors,
    colorsRGBValues,
} from './colors'
import { clearPvP } from '../state/actions'

const colourA = '#1f77b4'
const colourB = '#e82573'

const prTransformer = (user1 = '', user2 = '') => (left = [], right = [], pullRequests = []) => {
    const user1Prs = pullRequests
        .filter(({ author }) => author === user1)

    const user2Prs = pullRequests
        .filter(({ author }) => author === user2)

    const linesTransform = (lines = []) => lines
        .map((line = {}) => {
            const line1 = {
                ...line,
                label: `${user1} ${line.label}`,
                lineStyles: {
                    strokeDasharray: '6, 6',
                    strokeWidth: 2,
                },
                data: user1Prs
            }

            const line2 = {
                ...line,
                label: `${user2} ${line.label}`,
                color: `rgba(${colorsRGBValues[line.color]}, 0.6)`,
                data: user2Prs
            }
            return [
                line1,
                line2,
            ]
        })
        .flat()

    const newLeft = linesTransform(left)
    const newRight = linesTransform(right)

    const legendDefaults = {
        anchor: 'top-left',
        direction: 'column',
        justify: false,
        translateX: 10,
        translateY: 10,
        itemsSpacing: 0,
        itemDirection: 'left-to-right',
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 1,
        symbolSize: 12,
        symbolShape: 'square',
        symbolBorderColor: 'rgba(0, 0, 0, .9)',
        toggleSerie: true,
        itemTextColor: 'white', // TODO: use theme theme.palette.text.primary
    }

    const legends = [
        ...(left.length > 0
            ? [{
                ...legendDefaults,
                data: newLeft,
            }]
            : []
        ),
        ...(right.length > 0
            ? [{
                ...legendDefaults,
                data: newRight,
                anchor: 'top-right',
                translateX: -10,
                itemDirection: 'right-to-left',
            }]
            : []
        ),
    ]

    return [newLeft, newRight, legends]
}

const getStats = (userData1 = {}, userData2 = {}) => {
    const stats = [
        {
            title: 'Total Merged',
            id: 'totalPRs',
        },
        {
            title: 'Total approved',
            id: 'uniquePRsApproved',
        },
        {
            title: 'Comments given',
            id: 'commentsGiven',
        },
        {
            title: 'Comments received',
            id: 'commentsReceived',
        },
        // {
        //     title: 'Total positive sentiment',
        //     id: 'sentimentTotalPositiveScore',
        // },
        // {
        //     title: 'Total negative sentiment',
        //     id: 'sentimentTotalNegativeScore',
        // },
        {
            title: 'Average positive sentiment',
            id: 'sentimentAveragePositiveScore',
        },
        {
            title: 'Average negative sentiment',
            id: 'sentimentAverageNegativeScore',
        },
        {
            title: 'Average size',
            id: 'prSize',
        },
        {
            title: 'Total additions',
            id: 'prTotalAdditions',
        },
        {
            title: 'Total deletions',
            id: 'prTotalDeletions',
        },
        {
            title: 'Average days open',
            id: 'age',
        },
        // repo count
    ]

    const formattedStats = stats
        .filter(({ id } = {}) => Number.isInteger(userData1[id]) &&  Number.isInteger(userData2[id]))
        .map((stat = {}) => {
            const id = stat.id
            const lValue = userData1[id]
            const rValue = userData2[id]

            const lColor = colourA
            const rColor = colourB

            const lPercent = Math.ceil((100 *  lValue) / (lValue + rValue))
            const rPercent = 100 - lPercent

            return {
                ...stat,
                lValue,
                lColor,
                lPercent,
                rValue,
                rColor,
                rPercent,
            }
        })

    return formattedStats
}

const SelectUser = (props = {}) => {
    const {
        setUser,
        user = '',
        color,
        otherUser,
        users = [],
    } = props

    return <Select
            value={user}
            style={{
                color,
                fontSize: '2rem'
            }}

            onChange={(e) => setUser(e.target.value)}
            inputProps={{ 'aria-label': 'Select a user' }}
        >
        {
            users
                .filter(user => user !== otherUser)
                .map(user => <MenuItem  key={user} value={user} >{user}</MenuItem>)
        }
    </Select>
}

const getUsers = (users = []) => {
    const quertString = pathOr('', ['location', 'search'], window)
    const urlParams = new URLSearchParams(quertString);
    const path = pathOr('', ['location', 'pathname'], window)
    const [, p1Path, p2Path] = /^[\w-/]+$/.test(path)
        ? path
            .split('/')
            .filter(x => x && x !== 'community-health')
        : []
    const player1 = p1Path || urlParams.get('player1') || '';
    const player2 = p2Path || urlParams.get('player2') || '';

    const [userA, userB] = users

    return [
        /\w+/.test(player1)
            ? player1
            : userA,
        player1 !== player2 && /\w+/.test(player2)
            ? player2
            : userB,
    ]
}

// battle duration
// winner is, sore breakdown
// colour per user or for winner?
const PvP = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    removePvP,
    classes,
} = {}) => {
    const users = usersData.map(x => x.author)
    const [userA, userB] = getUsers(users)
    const [user1 = userA, setUser1] = useState()
    const [user2 = userB, setUser2] = useState()

    const userData1 = usersData
        .find(x => x.author === user1) || {}
    const userData2 = usersData
        .find(x => x.author === user2) || {}

    const stats = getStats(userData1, userData2)

    const mergedPrData = pullRequests
        .filter(({ mergedAt } = {}) => mergedAt)

    const user1PrData = mergedPrData
        .filter(({ author }) => author === user1)

    const user2PrData = mergedPrData
        .filter(({ author }) => author === user2)

    const chunkyData = chunkData(mergedPrData
        .filter(({ author }) => [user1, user2].includes(author)))

    return usersData.length > 0 && (
        <>
            <Paper>
                <Button
                    className={classes.fill}
                    variant="outlined"
                    size="small"
                    value="Back to main view"
                    color="secondary"
                    onClick={(e) => {
                        e.preventDefault()
                        removePvP()
                    }} />

                <P className={classes.copy}>This page is just for fun, a bigger or smaller number could be good, bar or not mean much, it depends on context.</P>

                <div className={classes.title}>
                    <SelectUser
                        user={user1}
                        color={colourA}
                        otherUser={user2}
                        setUser={setUser1}
                        users={users}
                    />
                    <SelectUser
                        user={user2}
                        color={colourB}
                        otherUser={user1}
                        setUser={setUser2}
                        users={users}
                    />
                </div>

                {
                    stats
                        .map((stat = {}, i) => <div key={`${stat.id}${i}`} className={classes.pvpWrapper} style={{ width: '100%'}}>
                            <P>{stat.title}</P>
                            <div key={stat.id} className={classes.pvpBarWrapper}>
                                <div className={classes.pvpL} style={{
                                    width: `${stat.lPercent}%`,
                                    backgroundColor: `${stat.lColor}`,
                                }}>
                                    <P>{stat.lValue}</P>
                                </div>
                                <div className={classes.pvpR} style={{
                                    width: `${stat.rPercent}%`,
                                    backgroundColor: `${stat.rColor}`,
                                }}>
                                    <P>{stat.rValue}</P>
                                </div>
                            </div>
                        </div>)
                }

                <P className={classes.copy}>And the winner is.... Both! Thanks for your great work!</P>
                <PullRequestCustom prTransformer={prTransformer(user1, user2)} />

                <Line
                    markers={releases}
                    showLegends={true}
                    title="Sentiments in PR"
                    data={[{
                        lines: [
                            {
                                label: `${user1} received`,
                                color: colors[2],
                                dataKey: 'commentSentimentScore',
                                data: user1PrData,
                            },
                            {
                                label: `${user1} given`,
                                color: colors[1],
                                dataKey: 'commentAuthorSentimentScore',
                                data: user1PrData,
                            },
                            {
                                label: `${user2} received`,
                                color: colors[2],
                                dataKey: 'commentSentimentScore',
                                data: user2PrData,
                            },
                            {
                                label: `${user2} given`,
                                color: colors[1],
                                dataKey: 'commentAuthorSentimentScore',
                                data: user2PrData,
                            },
                        ],
                        xAxis: 'left',
                    }]}
                />
                <ItemsTable  dataKeys={['author', 'commentSentimentScore', 'commentAuthorSentimentScore']} data={chunkyData} />

                <Line
                    markers={releases}
                    data={[{
                        lines: [
                            {
                                label: `${user1} PR size`,
                                color: colourA,
                                dataKey: 'prSize',
                                data: user1PrData,
                            },
                            {
                                label: `${user2} PR size`,
                                color: colourB,
                                dataKey: 'prSize',
                                data: user2PrData,
                            },
                        ],
                        xAxis: 'left',
                    }]}
                />
                <ItemsTable  dataKeys={['author', 'prSize']} data={chunkyData} />

                <Line
                    markers={releases}
                    data={[{
                        lines: [
                            {
                                label: `${user1} PR age`,
                                color: colourA,
                                dataKey: 'age',
                                data: user1PrData,
                            },
                            {
                                label: `${user2} PR age`,
                                color: colourB,
                                dataKey: 'age',
                                data: user2PrData,
                            },
                        ],
                        xAxis: 'left',
                    }]}
                />
                <ItemsTable  dataKeys={['author', 'age']} data={chunkyData} />

                <Button
                    className={classes.fill}
                    variant="outlined"
                    size="small"
                    value="Back to main view"
                    color="secondary"
                    onClick={(e) => {
                        e.preventDefault()
                        removePvP()
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
})

const mapDispatchToProps = dispatch => ({
    removePvP: (x) => dispatch(clearPvP(x)),
})

const styles = theme => ({
    'groupedCharts': {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
    },
    fill: {
        flexBasis: '100%',
        marginRight: 0,
    },
    copy: {
        flexBasis: '100%',
        textAlign: 'center',
    },
    title: {
        width: '100%',
        maxWidth: '1200px',
        flexWrap: 'nowrap',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    topButton: {
        width: '100%',
    },
    pvpWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        marginBottom: '1em',
        '& > p': {
            position: 'absolute',
            width: '100%',
            top: '8px',
            textAlign: 'center',
            margin: '0',
        }
    },
    pvpBarWrapper: {
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        alignContent: 'stretch',
    },
    pvpL: {
        textAlign: 'left',
        padding: '8px',
        '& p': {
            margin: 0
        }
    },
    pvpR: {
        textAlign: 'right',
        padding: '8px',
        '& p': {
            margin: 0
        }
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PvP))
