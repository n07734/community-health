import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet'

import {
    myPreFetchedReports,
} from '@/myReports/myReportsConfig'
import {
    preFetchedSRank24,
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
    preFetchedUsers,
} from '@/preFetchedInfo'
import { RepoInfo, ReportType } from '@/types/State'
import { getPreFetched } from '@/state/actions'
import { useDataStore } from '@/state/fetch'

type ChooseReportProps = {
    setNewReportType: (type: ReportType) => void,
}
const ChooseReport = ({ setNewReportType }: ChooseReportProps) => {
    const preFetchedName = useDataStore(useShallow(state => state.preFetchedName))

    const preFetchButton = (repoInfo:RepoInfo, i: number = 1) => <SheetClose
        key={`${i}`}
        asChild
    >
        <Button
            className="mr-2 mb-3"
            data-qa-id={`prefetch-${repoInfo.name}`}
            variant={preFetchedName === repoInfo.fileName ? undefined : 'secondary'}
            onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('report', repoInfo.fileName);
                history.pushState(null, '', url);
                setNewReportType('' as ReportType)
                getPreFetched(repoInfo)
            }}
        >
            {repoInfo?.name || 'Report'}
        </Button>
    </SheetClose>
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="link" className="normal-case text-foreground hover:text-primary text-base">Other reports</Button>
            </SheetTrigger>
            <SheetContent className="bg-background overflow-scroll">
                <SheetHeader>
                    <SheetTitle>See a different report</SheetTitle>
                </SheetHeader>
                <div className="mb-4">
                    {
                        myPreFetchedReports
                            .map(preFetchButton)
                    }
                    <div>
                        <p><a className="text-primary" href="https://2024.stateofjs.com/en-US/libraries/#tier_list">StateOfJS 24</a> S tier list</p>
                        {
                            preFetchedSRank24
                                .map(preFetchButton)
                        }
                    </div>
                    <p>Other reports</p>
                    <>
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
                        <p>Individual reports</p>
                        {
                            preFetchedUsers
                                .map(preFetchButton)
                        }
                    </>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ChooseReport
