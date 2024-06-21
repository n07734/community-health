import { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@mui/styles'
import { pathOr } from 'ramda'

import { P } from './shared/StyledTags'
import Button from './shared/Button'
import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import Line from './charts/Line'
import StatBars from './charts/StatBars'
import { chunkData } from './charts/lineHelpers'
import { useSubPage } from '../state/SubPageProvider'

const queryString = pathOr('', ['location', 'search'], window)
const urlParams = new URLSearchParams(queryString);

const getPlayer1Id = (usersData = []) => {
    return urlParams.get('player1') || usersData[0]?.author
}
const getPlayer2Id = (usersData = []) => {
    return urlParams.get('player2') || usersData[1]?.author
}

const PvP = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    classes,
} = {}) => {
    const theme = useTheme();
    const { togglePvPPage } = useSubPage()
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    const colorList = theme.palette.colorList

    const [player1Id, setPlayer1Id] = useState(getPlayer1Id(usersData))
    const [player2Id, setPlayer2Id] = useState(getPlayer2Id(usersData))

    const player1 = usersData
        .find(x => x.author === player1Id) || {}
    const player2 = usersData
        .find(x => x.author === player2Id) || {}

    const user1PrData = []
    const user2PrData = []
    const bothUsers = []
    pullRequests
        .forEach((item = {}) => {
            const author = item.author
            if (author === player1Id) {
                user1PrData.push(item)
                bothUsers.push(item)
            } else if (author === player2Id) {
                user2PrData.push(item)
                bothUsers.push(item)
            }
        })

    const chunkyData = chunkData(bothUsers)
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
                        togglePvPPage()
                    }} />

                <P className={classes.copy}>This page is just for fun, a bigger or smaller number could be good, bad or not mean much, it depends on context.</P>

                <StatBars
                    player1={player1}
                    player2={player2}
                    setPlayer1Id={setPlayer1Id}
                    setPlayer2Id={setPlayer2Id}
                    players={usersData}
                />

                <P className={classes.copy}>And the winner is.... Both! Thanks for your great work!</P>
                <GraphsWrap>
                    <Line
                        markers={releases}
                        showLegends={true}
                        title="Sentiments in PR"
                        data={[{
                            lines: [
                                {
                                    label: `${player1.name} received`,
                                    color: colorList[0],
                                    dataKey: 'commentSentimentScore',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player1.name} given`,
                                    color: colorList[2],
                                    dataKey: 'commentAuthorSentimentScore',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player2.name} received`,
                                    color: colorList[0],
                                    dataKey: 'commentSentimentScore',
                                    data: user2PrData,
                                },
                                {
                                    label: `${player2.name} given`,
                                    color: colorList[2],
                                    dataKey: 'commentAuthorSentimentScore',
                                    data: user2PrData,
                                },
                            ],
                            xAxis: 'left',
                        }]}
                        tableData={chunkyData}
                        tableKeys={['author', 'commentSentimentScore', 'commentAuthorSentimentScore']}
                    />
                    <Line
                        markers={releases}
                        data={[{
                            lines: [
                                {
                                    label: `${player1.name} PR size`,
                                    color: colorA,
                                    dataKey: 'prSize',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player2.name} PR size`,
                                    color: colorB,
                                    dataKey: 'prSize',
                                    data: user2PrData,
                                },
                            ],
                            xAxis: 'left',
                        }]}
                        tableKeys={['author', 'prSize']}
                        tableData={chunkyData}
                    />
                    <Line
                        markers={releases}
                        data={[{
                            lines: [
                                {
                                    label: `${player1.name} PR age`,
                                    color: colorA,
                                    dataKey: 'age',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player2.name} PR age`,
                                    color: colorB,
                                    dataKey: 'age',
                                    data: user2PrData,
                                },
                            ],
                            xAxis: 'left',
                        }]}
                        tableKeys={['author', 'age']}
                        tableData={chunkyData}
                    />
                </GraphsWrap>
                <Button
                    className={classes.fill}
                    variant="outlined"
                    size="small"
                    value="Back to main view"
                    color="secondary"
                    onClick={(e) => {
                        e.preventDefault()
                        togglePvPPage()
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


const styles = () => ({
    fill: {
        width: '100%',
        marginRight: 0,
    },
    copy: {
        width: '100%',
        textAlign: 'center',
    },
    topButton: {
        width: '100%',
    },
})

export default connect(mapStateToProps)(withStyles(styles)(PvP))
