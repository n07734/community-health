
import { connect } from 'react-redux'
import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Radar from '../charts/Radar'
import Button from '../shared/Button'
import formatRadarData from '../../format/radarData'
import { sortByKeys } from '../../utils'
import { useSubPage } from '../../state/SubPageProvider'
import { UsersInfo, UserData, FetchInfo, UserDataNumbersKeys } from '../../types/State'
import { RadarData } from '../../types/Components'


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
    classes: Record<string, string>
}
const UserTrends = ({
    usersData = [],
    userIds = [],
    usersInfo = {},
    classes = {},
}:UserTrendsProps) => {
    const theme:Theme = useTheme();
    const { togglePvPPage, setUserPage } = useSubPage()

    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const { showNames } = useShowNames()

    const radarData = formatRadarData(usersData)
    const contributionsRadar = radialChartsContributions(radarData, userIds.length > 0)

    const isTeamReport = userIds.length > 0
    const title = isTeamReport
        ? 'Team members'
        : 'Top contributors'

    return contributionsRadar.length > 0 && (
        <Paper className={classes.row}>
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
                    className={classes.fullW}
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

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = ():TagStyles => ({
    'fullW': {
        width: '100%',
    },
    row: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
    },
})

export default connect(mapStateToProps)(withStyles(styles)(UserTrends))
