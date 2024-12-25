import { useEffect } from 'react'
import { connect } from 'react-redux'

import { AnyForLib, AnyForNow } from '@/types/State'

import Message, { ErrorInputs } from '@/components/home/Message'
import { getPreFetched } from '@/state/actions'
import { useSubPage } from '@/state/SubPageProvider'

import {
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
} from '@/preFetchedInfo'

import {
    myPreFetchedReports,
} from '@/myReports/myReportsConfig'

type ReportInfo = {
    name?: string;
    fileName: string;
}

type PrefetchedReportProps = {
    error: ErrorInputs
    preFetchedName: string
    getPreFetchedReport: (arg: ReportInfo) => void
}
const PrefetchedReport = (props: PrefetchedReportProps) => {
    const {
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
    const report = urlReport || myPreFetchedReports[0]?.fileName || 'bluesky-social-social-app'

    const isAPreFetchedReport = allItems
        .some(x => x.fileName === report)
    const repoInfo = isAPreFetchedReport
        ? allItems
            .find(x => x.fileName === (preFetchedName || report)) as ReportInfo
        : { fileName: report }

    useEffect(() => {
        getPreFetchedReport(repoInfo as ReportInfo)
        if (player1 && player2) {
            togglePvPPage()
        } else if (user) {
            setUserPage(user)
        }
    }, [getPreFetchedReport, player1, player2, user])

    return (
        <>
            {
                error
                    && <Message
                        error={error}
                        className="col-span-full mb-4"
                    />
            }
        </>
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

export default connect(mapStateToProps, mapDispatchToProps)(PrefetchedReport)
