import { useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import Message from '../Message'
import { P } from '../../shared/StyledTags'
import styles from './styles'
import {
    getPreFetched,
    setPvP,
} from '../../../state/actions'
import {
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
} from '../../../preFetchedInfo'

import {
    myPreFetchedReports,
} from '../../../myReports/myReportsConfig'

const PrefetchedOptions = (props = {}) => {
    const {
        classes,
        error,
        preFetchedName = '',
        getPreFetchedReport,
        setPvPArena,
    } = props
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString)
    const path = window?.location?.pathname
    const [, p1Path, p2Path] = /^[\w-/]+$/.test(path)
        ? path
            .split('/')
            .filter(x => x && x !== 'community-health')
        : []
    const player1 = p1Path || urlParams.get('player1') || ''
    const player2 = p2Path || urlParams.get('player2') || ''

    const allItems = [
        ...myPreFetchedReports,
        ...preFetchedRepos,
        ...preFetchedTeams,
        ...preFetchedOrgs,
    ]

    const report = urlParams.get('report') || myPreFetchedReports[0]?.fileName || 'facebook-react'

    const isAPreFetchedReport = allItems
        .some(x => x.fileName === report)
    const repoInfo = isAPreFetchedReport
        ? allItems
            .find(x => x.fileName === report)
        : { fileName: report }

    useEffect(() => {
        if (player1 && player2) {
            setPvPArena()
        }
        getPreFetchedReport(repoInfo)
    }, [getPreFetchedReport, player1, player2, setPvPArena])

    const preFetchButton = (repoInfo = {}, i) => <Button
        value={repoInfo.name}
        key={i}
        color={preFetchedName === repoInfo.fileName ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedReport(repoInfo)
        }}
    />

    return (
        <div className={classes.preFetched}>
            {
                myPreFetchedReports
                    .map(preFetchButton)
            }
            {
                !myPreFetchedReports.length > 0 && isAPreFetchedReport && <>
                    <P>
                        See data from some popular Open Source repositories.
                    </P>
                    {
                        preFetchedRepos
                            .map(preFetchButton)
                    }
                    <P>
                        See data from some popular Open Source orgs.
                    </P>
                    {
                        preFetchedOrgs
                            .map(preFetchButton)
                    }
                    <P>See data from some popular OSS teams.</P>
                    {
                        preFetchedTeams
                            .map(preFetchButton)
                    }
                    {
                        error
                            && <Message
                                error={error}
                                className={classes.fullRow}
                            />
                    }
                </>
            }
            </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedName: state.preFetchedName,
    error: state.preFetchedError,
})

const mapDispatchToProps = dispatch => ({
    setPvPArena: (x) => dispatch(setPvP(x)),
    getPreFetchedReport: (x) => dispatch(getPreFetched(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PrefetchedOptions))
