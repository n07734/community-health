
import { connect } from 'react-redux'

import { Issue, PullRequest } from '@/types/FormattedData'
import { AllowedColors } from '@/types/Components'
import { FetchInfo } from '@/types/State'

import { useTheme } from "@/components/ThemeProvider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Paper from '@/components/shared/Paper'
import PrefetchedForm from '@/components/home/DataOptions/PrefetchedForm'
import DateRange from './DateRange'
import { useShowNames } from '@/state/ShowNamesProvider'
import { graphColors } from '@/components/colors'

type TitleProps = FetchInfo & {
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

type ReportDescriptionProps = {
    fetches: FetchInfo
    preFetchedName?: string
    pullRequests?: PullRequest[]
    issues?: Issue[]
    userIds?: string[]
    reportDescription?: string
}
const ReportDescription = ({
    fetches,
    preFetchedName = '',
    pullRequests = [],
    issues = [],
    userIds = [],
    reportDescription = '',
}:ReportDescriptionProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const { showNames, toggleShowNames } = useShowNames()

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper>
        <h2 data-qa-id="report-title" className="truncate">
            <Title {...fetches} colorA={colorA} colorB={colorB}/>
        </h2>
        {
            reportDescription
                    && <p>{reportDescription}</p>
        }
        {
            userIds.length > 1
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
            <Label htmlFor="spartacus-mode">Spartacus mode, this can help look for trends.</Label>
        </div>

        <DateRange />
        {
            preFetchedName.length > 0
                    && <PrefetchedForm />
        }
    </Paper>)
}

type State = {
    fetches: FetchInfo
    preFetchedName: string
    pullRequests: PullRequest[]
    issues: Issue[]
    userIds: string[]
    reportDescription: string
}
const mapStateToProps = (state:State) => ({
    fetches: state.fetches,
    preFetchedName: state.preFetchedName,
    pullRequests: state.pullRequests,
    issues: state.issues,
    userIds: state.fetches.userIds,
    reportDescription: state.reportDescription,
})

export default connect(mapStateToProps)(ReportDescription)
