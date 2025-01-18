import { useEffect } from 'react'

import Message from '@/components/home/Message'
import { getPreFetched } from '@/state/actions'
import { useSubPage } from '@/state/SubPageProvider'

import {
    myPreFetchedReports,
} from '@/myReports/myReportsConfig'
import { useFetchStore } from '@/state/fetch'

type ReportInfo = {
    name?: string;
    fileName: string;
}


const PrefetchedReport = () => {
    const error = useFetchStore(state => state.error)
    const { togglePvPPage, setUserPage } = useSubPage()
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString)

    const player1 = urlParams.get('player1') || ''
    const player2 = urlParams.get('player2') || ''
    const user = urlParams.get('user') || ''

    const urlReport = urlParams.get('report')
    const report = urlReport || myPreFetchedReports[0]?.fileName || 'bluesky-social-social-app'

    useEffect(() => {
        getPreFetched({ fileName: report } as ReportInfo)
    }, [report])

    useEffect(() => {
        if (player1 && player2) {
            togglePvPPage()
        } else if (user) {
            setUserPage(user)
        }
    }, [togglePvPPage, setUserPage, player1, player2, user])

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
