
import { connect } from 'react-redux'
import { EventInfo, PullRequest } from '@/types/FormattedData'
import { UsersInfo, UserData, UserDataNumbersKeys, FetchInfo, SavedEvent } from '@/types/State'
import { BarData, TableData } from '@/types/Graphs'

import { useShowNames } from '@/state/ShowNamesProvider'
import Paper from '@/components/shared/Paper'
import GraphsWrap from '@/components/shared/GraphsWrap'
import ChartDescription from '@/components/shared/ChartDescription'
import Bar from '@/components/charts/Bar'
import Chord from '@/components/charts/Chord'
import Line from '@/components/charts/Line'
import Pie from '@/components/charts/Pie'
import { splitByAuthor, rainbowData } from '@/components/charts/lineHelpers'
import { sortByKeys } from '@/utils'
import { useTheme } from "@/components/ThemeProvider"
import { graphColors } from '@/components/colors'
import { formatMarkers } from '@/format/releaseData'

type TeamTrendsProps = {
    pullRequests: PullRequest[]
    chunkyData: TableData[][]
    usersData?: UserData[]
    allRepos?:Record<string, number>
    userIds?: string[]
    releases: EventInfo[]
    events: SavedEvent[]
    usersInfo: UsersInfo
}
const TeamTrends = ({
    pullRequests = [],
    chunkyData = [],
    usersData = [],
    allRepos = {},
    userIds = [],
    releases = [],
    events = [],
    usersInfo = {},
}: TeamTrendsProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const { showNames } = useShowNames()

    const markers = formatMarkers({ events, releases, usersInfo })

    const maxAuthors = userIds.length || 15
    const keys:UserDataNumbersKeys[] = [
        'commentsGiven',
        'approvalsGiven',
    ]

    const sortedUsers = usersData
        .sort(sortByKeys(keys))

    const barData:BarData[] = sortedUsers
        .map((x,i) => ({
            commentsGiven: x.commentsGiven,
            commentsReceived: x.commentsReceived,
            uniquePRsApproved: x.uniquePRsApproved,
            totalPRs: x.totalPRs,
            // Needs white space padding to keep the bars
            author: showNames ? x.author : `${Array(i).fill(' ').join('')}Spartacus`,
            name: showNames ? usersInfo[x.author]?.name || x.author : `${Array(i).fill(' ').join('')}Spartacus`,
        }))

    const chordDataWithName:UserData[] = sortedUsers
        .map((x) => ({
            ...x,
            name: usersInfo[x.author]?.name || x.author,
        }))

    const repoPie = rainbowData('repo', allRepos)
    const byAuthorData = splitByAuthor({ pullRequests, showNames, usersInfo })

    const withApprovalsByUserLength = chordDataWithName.filter(x => x.approvalsGiven > 0).length
    const withCommentsByUserLength = chordDataWithName.filter(x => x.commentsGiven > 0).length
    return usersData.length > 0 && (
        <Paper>
            <ChartDescription
                title="Contributions"
                expandText='guidance'
            >
                <p>Questions worth asking (with team context):</p>
                <ul>
                    <li>Is there a bus factor risk?</li>
                    <li>Are there any data points that stand out?</li>
                    <li>How do the given and received metrics look?</li>
                    <li>How well spread are the collaboration metrics?</li>
                    <li>Any insights or things you would like to try to impact these metrics?</li>
                </ul>
            </ChartDescription>
            <GraphsWrap>
                <div className="flex flex-wrap justify-center w-full">
                    <div className="w-1/2 max-mm:w-full">
                        <Bar
                            data={barData}
                            indexBy="name"
                            title="Comments"
                            sortBy="commentsGiven"
                            max={maxAuthors}
                            bars={[
                                {
                                    dataKey: 'commentsGiven',
                                    color: colorA,
                                    label: 'given',
                                },
                                {
                                    dataKey: 'commentsReceived',
                                    color: colorB,
                                    label: '*received',
                                },
                            ]}
                        />
                        <p>*Received comments can also come from out of team so can be higher.</p>
                    </div>
                    <div className="w-1/2 max-mm:w-full">
                        <Bar
                            data={barData}
                            indexBy="name"
                            title="PRs"
                            sortBy="uniquePRsApproved"
                            max={maxAuthors}
                            bars={[
                                {
                                    dataKey: 'uniquePRsApproved',
                                    color: colorA,
                                    label: 'approved',
                                },
                                {
                                    dataKey: 'totalPRs',
                                    color: colorB,
                                    label: 'opened',
                                },
                            ]}
                        />
                    </div>
                </div>

                {
                    (withCommentsByUserLength > 0 || withApprovalsByUserLength > 0) &&
                        <div className="w-full flex flex-wrap justify-center gap-4">
                            {
                                withCommentsByUserLength > 0 &&
                                    <Chord
                                        data={chordDataWithName}
                                        preSorted={true}
                                        dataKey="commentsByUser"
                                        title="Comment contributions"
                                    />
                            }
                            {
                                withApprovalsByUserLength > 0 &&
                                    <Chord
                                        data={chordDataWithName}
                                        preSorted={true}
                                        dataKey="approvalsByUser"
                                        title="Approval contributions"
                                    />
                            }
                        </div>
                }
                <p>These chord charts show how contributions are given and received, the dominant colour indicates more contribution</p>
                {
                    byAuthorData.length > 0 && byAuthorData?.[0]?.lines?.length < 21 &&
                        <Line
                            title="PRs by author"
                            markers={markers}
                            showLegends={true}
                            data={byAuthorData}
                            tableData={chunkyData}
                            tableKeys={['author', 'repo']}
                        />
                }
                {
                    repoPie.pieData.length > 0 &&
                        <Pie
                            data={repoPie.pieData}
                            title={repoPie.sectionTitle}
                        />
                }
            </GraphsWrap>
        </Paper>
    )
}

type State = {
    usersData: UserData[]
    releases: EventInfo[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    releases: state.releases,
    usersData: state.usersData,
    userIds: state.fetches.userIds,
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(TeamTrends)
