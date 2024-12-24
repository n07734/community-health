import { useState } from 'react'
import { connect } from 'react-redux'
import pathOr from 'ramda/es/pathOr'

import { EventInfo, PullRequest } from '@/types/FormattedData'
import { FetchInfo, SavedEvent, UserData, UsersInfo } from '@/types/State'

import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'

import { Button } from '@/components/ui/button'
import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import Line from './charts/Line'
import StatBars from './charts/StatBars'

import { chunkData } from './charts/lineHelpers'
import { useSubPage } from '@/state/SubPageProvider'
import { colors } from '@/components/colors'
import { formatMarkers } from '@/format/releaseData'

const queryString = pathOr('', ['location', 'search'], window)
const urlParams = new URLSearchParams(queryString);

const getPlayer1Id = (usersData:UserData[] = []) => {
    return urlParams.get('player1') || usersData[0]?.author
}
const getPlayer2Id = (usersData:UserData[] = []) => {
    return urlParams.get('player2') || usersData[1]?.author
}

type PvPProps = {
    pullRequests: PullRequest[]
    releases: EventInfo[]
    usersData: UserData[]
    events: SavedEvent[]
    usersInfo: UsersInfo
}
const PvP = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    events = [],
    usersInfo = {},
}:PvPProps) => {
    const { togglePvPPage } = useSubPage()
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const [player1Id, setPlayer1Id] = useState(getPlayer1Id(usersData))
    const [player2Id, setPlayer2Id] = useState(getPlayer2Id(usersData))

    const player1:UserData = usersData
        .find(x => x.author === player1Id) as UserData
    const player2 = usersData
        .find(x => x.author === player2Id) as UserData

    const user1PrData:PullRequest[] = []
    const user2PrData:PullRequest[] = []
    const bothUsers:PullRequest[] = []
    pullRequests
        .forEach((item) => {
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

    const markers = formatMarkers({ events, releases, usersInfo })

    return usersData.length > 0 && (
        <>
            <Paper>
                <Button
                    className="w-full mr-0 mb-4"
                    color="secondary"
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault()
                        togglePvPPage()
                    }} >
                        Back to main view
                </Button>

                <p className="w-full text-center">This page is just for fun, a bigger or smaller number could be good, bad or not mean much, it depends on context.</p>

                <StatBars
                    player1={player1}
                    player2={player2}
                    setPlayer1Id={setPlayer1Id}
                    setPlayer2Id={setPlayer2Id}
                    players={usersData}
                />

                <p className="w-full text-center">And the winner is.... Both! Thanks for your great work!</p>
                <GraphsWrap>
                    <Line
                        markers={markers}
                        showLegends={true}
                        title="Sentiments in PR"
                        data={[{
                            lines: [
                                {
                                    label: `${player1.name} received`,
                                    color: colors[0],
                                    dataKey: 'commentSentimentScore',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player1.name} given`,
                                    color: colors[2],
                                    dataKey: 'commentAuthorSentimentScore',
                                    data: user1PrData,
                                },
                                {
                                    label: `${player2.name} received`,
                                    color: colors[0],
                                    dataKey: 'commentSentimentScore',
                                    data: user2PrData,
                                },
                                {
                                    label: `${player2.name} given`,
                                    color: colors[2],
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
                        markers={markers}
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
                        markers={markers}
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
                    className="w-full mr-0 mb-4"
                    color="secondary"
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault()
                        togglePvPPage()
                        window && window.scrollTo(0, 0)
                    }} >
                    Back to main view
                </Button>
            </Paper>
        </>
    )
}

type State = {
    pullRequests: PullRequest[]
    releases: EventInfo[]
    usersData: UserData[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
    usersData: state.usersData,
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(PvP)
