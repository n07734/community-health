
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import { always, cond, T, propSatisfies, where } from 'ramda'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import { useShowNames } from '../../state/ShowNamesProvider'
import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import PrefetchedForm from '../home/DataOptions/PrefetchedForm'
import DateRange from './DateRange'

const RepoTitle = ({ repo, org, colorA, colorB } = {}) => org === repo
    ? (<span style={{ color: colorB }}>{repo}</span>)
    : (
        <>
            <span style={{ color: colorA }}>{org}</span>/<span style={{ color: colorB }}>{repo}</span>
        </>
    )

const IndividualTitle = ({ usersInfo = {}, userIds = [], colorA, colorB } = {}) => {
    const { userId , name } = usersInfo[userIds[0]] || {}
    return !name
        ? (<span style={{ color: colorB }}>{userId}</span>)
        : (
            <>
                <span style={{ color: colorA }}>{name}</span>: <span style={{ color: colorB }}>{userId}</span>
            </>
        )
}

const TeamTitle = ({ teamName, colorB }) => <span style={{ color: colorB }}>{teamName}</span>
const OrgTitle = ({ org, colorB } = {}) => <span style={{ color: colorB }}>{org}</span>

const titleCopy = cond([
    [
        where({
            org: Boolean,
            repo: Boolean,
        }),
        RepoTitle,
    ],
    [
        where({
            org: Boolean,
        }),
        OrgTitle,
    ],
    [
        propSatisfies(Boolean,'teamName'),
        TeamTitle,
    ],
    [
        propSatisfies(x => x.length === 1, 'userIds'),
        IndividualTitle,
    ],
    [
        T,
        always('Report'),
    ],
])

const ReportDescription = ({
    fetches = {},
    preFetchedName = '',
    pullRequests = [],
    issues = [],
    userIds = [],
    reportDescription = '',
    classes,
} = {}) => {
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const { showNumbers, toggleShowNumbers } = useShowNumbers()
    const { showNames, toggleShowNames } = useShowNames()

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper className={classes.root}>
            <H className={classes.heading} level={2}>
                {
                    titleCopy({
                        ...fetches,
                        colorA,
                        colorB,
                    })
                }
            </H>
            {
                reportDescription
                    && <P>{reportDescription}</P>
            }
            {
                userIds.length > 1
                    && <P>Team's GitHub IDs: { userIds.join(', ') }</P>
            }
            {
                userIds.length !== 1
                    &&  <P>
                    <Switch
                        onChange={toggleShowNames}
                        checked={!showNames}
                        name="checkedA"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                    Toggle to hide GitHub usernames, this can help look for trends.
                </P>
            }
            {
                userIds.length !== 1
                    &&  <P>
                    <Switch
                        onChange={toggleShowNumbers}
                        checked={!showNumbers}
                        name="checkedB"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                    Toggle to hide graph numbers, this can help look for trends.
                </P>
            }

            <DateRange />
            {
                preFetchedName.length > 0
                    && <PrefetchedForm />
            }
        </Paper>)
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
    preFetchedName: state.preFetchedName,
    pullRequests: state.pullRequests,
    issues: state.issues,
    userIds: state.fetches.userIds,
    reportDescription: state.reportDescription,
})

const styles = theme => ({
    root: {
        display: 'block',
    },
    heading: theme.copy.h1,
})

export default connect(mapStateToProps)(withStyles(styles)(ReportDescription))
