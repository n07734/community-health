import { useEffect, useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'
import Message from '@/components/home/Message'
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
import { useDataStore, useFetchStore } from '@/state/fetch'

type ReportInfo = {
    name?: string;
    fileName: string;
}

const allItems = [
    ...myPreFetchedReports,
    ...preFetchedRepos,
    ...preFetchedTeams,
    ...preFetchedOrgs,
]

const PrefetchedReport = () => {
    const preFetchedName = useDataStore(useShallow(state => state.preFetchedName))
    const error = useFetchStore(state => state.error)
    const { togglePvPPage, setUserPage } = useSubPage()
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString)

    const player1 = urlParams.get('player1') || ''
    const player2 = urlParams.get('player2') || ''
    const user = urlParams.get('user') || ''

    const urlReport = urlParams.get('report')
    const report = urlReport || myPreFetchedReports[0]?.fileName || 'bluesky-social-social-app'

    const isAPreFetchedReport = allItems
        .some(x => x.fileName === report)

    const repoInfo = useMemo(() => isAPreFetchedReport
        ? allItems
            .find(x => x.fileName === (preFetchedName || report)) as ReportInfo
        : { fileName: report }
    , [isAPreFetchedReport, preFetchedName, report])

    useEffect(() => {
        getPreFetched(repoInfo as ReportInfo)
        if (player1 && player2) {
            togglePvPPage()
        } else if (user) {
            setUserPage(user)
        }
    }, [togglePvPPage, setUserPage, player1, player2, user, repoInfo])

    return (
        <>
            {
                error && error.message
                    && <Message
                        error={error}
                        className="col-span-full mb-4"
                    />
            }
        </>
    )
}

export default PrefetchedReport
