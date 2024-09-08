import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'
import { AnyForLib, AnyForNow, RepoInfo } from '../../../types/State'

import Button from '../../shared/Button'
import Message, { ErrorInputs } from '../Message'
import styles from './styles'
import { getPreFetched } from '../../../state/actions'
import { useSubPage } from '../../../state/SubPageProvider'
import {
    preFetchedSRank23,
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
} from '../../../preFetchedInfo'

import {
    myPreFetchedReports,
} from '../../../myReports/myReportsConfig'

type ReportInfo = {
    name?: string;
    fileName: string;
}

type PrefetchedOptionsProps = {
    classes: Record<string, string>
    error: ErrorInputs
    preFetchedName: string
    getPreFetchedReport: (arg: ReportInfo) => void
}
const PrefetchedOptions = (props: PrefetchedOptionsProps) => {
    const {
        classes,
        error,
        preFetchedName = '',
        getPreFetchedReport,
    } = props
    const { togglePvPPage, setUserPage } = useSubPage()
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString)

    const player1 = urlParams.get('player1') || ''
    const player2 = urlParams.get('player2') || ''
    const user = urlParams.get('user') || ''

    const allItems = [
        ...myPreFetchedReports,
        ...preFetchedRepos,
        ...preFetchedTeams,
        ...preFetchedOrgs,
    ]

    const urlReport = urlParams.get('report')
    const report = urlReport || myPreFetchedReports[0]?.fileName || 'vitejs'

    const isAPreFetchedReport = allItems
        .some(x => x.fileName === report)
    const repoInfo = isAPreFetchedReport
        ? allItems
            .find(x => x.fileName === (preFetchedName || report))
        : { fileName: report }

    useEffect(() => {
        getPreFetchedReport(repoInfo as ReportInfo)
        if (player1 && player2) {
            togglePvPPage()
        } else if (user) {
            setUserPage(user)
        }
    }, [getPreFetchedReport, player1, player2, user])

    const preFetchButton = (repoInfo:RepoInfo, i: number = 1) => <Button
        value={repoInfo?.name || 'Report'}
        key={`${i}`}
        qaId={`prefetch-${repoInfo.name}`}
        color={preFetchedName === repoInfo.fileName ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedReport(repoInfo)
        }}
    />

    const [showAllReports, setAllReports] = useState(false)

    return (
        !isAPreFetchedReport && urlReport
            ? <div></div>
            : <div className={classes.preFetched}>
                {
                    myPreFetchedReports
                        .map(preFetchButton)
                }
                <div>
                    <p><a className="text-primary" href="https://2023.stateofjs.com/en-US/libraries/#tier_list">StateOfJS 23</a> S tier list</p>
                    {
                        preFetchedSRank23
                            .map(preFetchButton)
                    }
                </div>
                <p>Other reports</p>

                {
                    myPreFetchedReports.length === 0 && <>
                        {
                            !showAllReports && repoInfo && Object.keys(repoInfo).length > 0
                                && preFetchButton(repoInfo)
                        }
                        {
                            showAllReports
                                && <>
                                    <p>Repository reports</p>
                                    {
                                        preFetchedRepos
                                            .map(preFetchButton)
                                    }
                                    <p>Org reports</p>
                                    {
                                        preFetchedOrgs
                                            .map(preFetchButton)
                                    }
                                    <p>Team reports</p>
                                    {
                                        preFetchedTeams
                                            .map(preFetchButton)
                                    }
                                </>
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
                <Button
                    value={showAllReports ? 'Hide other reports' : 'Show more OSS reports...'}
                    color={showAllReports ? 'primary' : 'secondary'}
                    onClick={(e) => {
                        e.preventDefault()
                        setAllReports(!showAllReports)
                    }}
                />
            </div>
    )
}

type State = {
    preFetchedName: string
    preFetchedError: ErrorInputs
}
const mapStateToProps = (state: State) => ({
    preFetchedName: state.preFetchedName,
    error: state.preFetchedError,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    getPreFetchedReport: (info: AnyForNow) => dispatch(getPreFetched(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PrefetchedOptions))
