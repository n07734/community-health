
import { connect } from 'react-redux'

import { UsersInfo, UserData, FetchInfo, UserDataNumbersKeys } from '@/types/State'
import { RadarData } from '@/types/Components'

import { useTheme } from '@/components/ThemeProvider'
import { useShowNames } from '@/state/ShowNamesProvider'
import { useSubPage } from '@/state/SubPageProvider'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import Radar from '@/components/charts/Radar'
import Button from '@/components/shared/Button'

import formatRadarData from '@/format/radarData'
import { sortByKeys } from '@/utils'
import { graphColors } from '@/components/colors'

const radialChartsContributions = ({
    maxValues = {},
    users = [],
}: { maxValues:Record<string, number>, users:UserData[]}, isTeamPage: boolean): RadarData[] => {
    const keys:UserDataNumbersKeys[] = [
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

    const items:{ area: string, dataKey:UserDataNumbersKeys }[] = [
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
            area: 'PR count',
            dataKey: 'totalPRs',
        },
        {
            area: 'PR size',
            dataKey: 'prSize',
        },
    ]

    const radarData:RadarData[] = topXUsers
        .map(user => {
            const data = items
                .map(({ area, dataKey }) => {
                    const originalUser = user[dataKey] || 0
                    const maxValue = maxValues[dataKey] || 0

                    return {
                        area,
                        value: originalUser && maxValue ? (originalUser / maxValue) * 100 : 0,
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

type UserTrendsProps = {
    usersData: UserData[]
    userIds: string[]
    usersInfo: UsersInfo
}
const UserTrends = ({
    usersData = [],
    userIds = [],
    usersInfo = {},
}:UserTrendsProps) => {
    const { theme } = useTheme()
    const { togglePvPPage, setUserPage } = useSubPage()

    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const { showNames } = useShowNames()

    const radarData = formatRadarData(usersData)
    const contributionsRadar = radialChartsContributions(radarData, userIds.length > 0)

    const isTeamReport = userIds.length > 0
    const title = isTeamReport
        ? 'Team members'
        : 'Top contributors'

    return contributionsRadar.length > 0 && (
        <Paper className="flex flex-wrap flex-row justify-center">
            <ChartDescription title={title} />
            {
                contributionsRadar
                    .map((info, i) => {
                        const gitName = info.title
                        const name = usersInfo[gitName]?.name || gitName
                        return <div key={i} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Radar
                                showTitle={false}
                                height={240}
                                colors={[
                                    (i + 1) % 2 === 0
                                        ? colorA
                                        : colorB,
                                ]}
                                {...info}
                            />
                            <Button
                                value={showNames ? name : 'Spartacus'}
                                color={
                                    (i + 1) % 2 === 0
                                        ? 'secondary'
                                        : 'primary'
                                }
                                onClick={(e) => {
                                    e.preventDefault()
                                    setUserPage(gitName)
                                    window && window.scrollTo(0, 0)
                                }}
                            />
                        </div>
                    })
            }
            {
                isTeamReport && <Button
                    className="w-full"
                    value="PvP arena"
                    color="primary"
                    onClick={(e) => {
                        e.preventDefault()
                        togglePvPPage()
                        window && window.scrollTo(0, 0)
                    }}
                />
            }
        </Paper>
    )
}

type State = {
    usersData: UserData[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(UserTrends)
