
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@mui/styles'
import Switch from '@mui/material/Switch'
import { Theme } from '@mui/material/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import PrefetchedForm from '../home/DataOptions/PrefetchedForm'
import DateRange from './DateRange'
import { Issue, PullRequest } from '../../types/FormattedData'
import { AllowedColors } from '../../types/Components'
import { FetchInfo } from '../../types/State'

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
        colorB = ''
    } = props
    const { userId = '' , name = '' }:{ userId:string , name:string } = usersInfo[userIds[0]] || {}

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
    classes?: any
}
const ReportDescription = ({
    fetches,
    preFetchedName = '',
    pullRequests = [],
    issues = [],
    userIds = [],
    reportDescription = '',
    classes,
}:ReportDescriptionProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const { showNames, toggleShowNames } = useShowNames()

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper className={classes.root}>
            <H className={classes.heading} level={2}>
                <Title {...fetches} colorA={colorA} colorB={colorB}/>
            </H>
            {
                reportDescription
                    && <P>{reportDescription}</P>
            }
            {
                userIds.length > 1
                    && <P>Team's GitHub IDs: { userIds.join(', ') }</P>
            }
            <P className={classes.switch}>
                <Switch
                    onChange={toggleShowNames}
                    checked={!showNames}
                    name="checkedA"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
                Hide GitHub ids/names, this can help look for trends.
            </P>
            {/* {
                // TODO: change this
                userIds.length !== 1
                    &&  <P className={classes.switch}>
                    <Switch
                        onChange={toggleShowNumbers}
                        checked={!showNumbers}
                        name="checkedB"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                    Hide graph numbers, this can help look for trends.
                </P>
            } */}

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

const styles = (theme:Theme) => ({
    root: {
        display: 'block',
    },
    heading: theme.copy.h1,
    switch: {
        marginBottom: '0',
    },
})

export default connect(mapStateToProps)(withStyles(styles)(ReportDescription))
