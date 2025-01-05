import { useShallow } from 'zustand/react/shallow'
import { AllowedColors } from '@/types/Components'
import { UsersInfo } from '@/types/State'

import { useTheme } from "@/components/ThemeProvider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Paper from '@/components/shared/Paper'
import PrefetchedForm from '@/components/home/DataOptions/PrefetchedForm'
import DateRangeInfo from './DateRangeInfo'
import DateSlider from './DateSlider'
import { useShowNames } from '@/state/ShowNamesProvider'
import { graphColors } from '@/components/colors'
import { useDataStore, useFetchStore } from '@/state/fetch'

type TitleProps = {
    repo: string
    org: string
    teamName: string
    usersInfo: UsersInfo
    userIds: string[]
    colorA: AllowedColors
    colorB: AllowedColors
}
const Title = (props:TitleProps) => {
    const {
        repo = '',
        org = '',
        teamName = '',
        usersInfo = {},
        userIds = [],
        colorA = '',
        colorB = '',
    } = props
    const { userId = '' , name = '' } = usersInfo[userIds[0]] || {}

    const firstString = org || teamName || name || userId

    const secondString = (!teamName && name && userId) || (repo && org !== repo && repo) || ''

    const firstColor = secondString
        ? colorA
        : colorB

    return (<>
        <span style={{ color: firstColor }}>{firstString}</span>
        {
            secondString &&
                <>/<span style={{ color: colorB }}>{secondString}</span></>
        }
    </>
    )
}

const ReportDescription = () => {
    const preFetchedName = useDataStore(useShallow(state => state.preFetchedName))
    const reportDescription = useDataStore(useShallow(state => state.reportDescription))
    const pullRequests = useDataStore(state => state.pullRequests)
    const issues = useDataStore(state => state.issues)

    const {
        repo,
        org,
        teamName,
        usersInfo,
        userIds = [],
    } = useFetchStore(useShallow((state) => state))

    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const { showNames, toggleShowNames } = useShowNames()

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper>
        <h2 data-qa-id="report-title" className="truncate">
            <Title
                repo={repo}
                org={org}
                teamName={teamName}
                usersInfo={usersInfo}
                userIds={userIds}
                colorA={colorA}
                colorB={colorB}
            />
        </h2>
        {
            reportDescription
                    && <p>{reportDescription}</p>
        }
        {
            userIds && userIds.length > 1
                    && <p>Team's GitHub IDs: { userIds.join(', ') }</p>
        }
        <div className="flex items-center space-x-2 pb-08">
            <Switch
                id="spartacus-mode"
                onCheckedChange={toggleShowNames}
                checked={!showNames}
                name="checkedA"
                className="dark:data-[state=unchecked]:bg-white"
            />
            <Label htmlFor="spartacus-mode">
                {
                    showNames
                        ? 'Who is Spartacus?'
                        : 'Spartacus mode can help look for trends.'
                }
            </Label>
        </div>
        <DateRangeInfo />
        <DateSlider />
        {
            preFetchedName.length > 0
                    && <PrefetchedForm />
        }
    </Paper>)
}

export default ReportDescription
