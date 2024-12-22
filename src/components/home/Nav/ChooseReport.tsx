import { connect } from 'react-redux'

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"

import {
    myPreFetchedReports,
} from '@/myReports/myReportsConfig'
import {
    preFetchedSRank23,
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
} from '@/preFetchedInfo'
import { AnyForLib, AnyForNow, RepoInfo, ReportType } from '@/types/State'
import { getPreFetched } from '@/state/actions'

type ChooseReportProps = {
    setNewReportType: (type: ReportType) => void,
    preFetchedName?: string,
    getPreFetchedReport: (arg: RepoInfo) => void
}
const ChooseReport = ({ setNewReportType, getPreFetchedReport, preFetchedName }: ChooseReportProps) => {
    console.log('ChooseReport',preFetchedName)
    const preFetchButton = (repoInfo:RepoInfo, i: number = 1) => <SheetClose
        key={`${i}`}
        asChild
    >
        <Button
            className="mr-2 mb-3"
            data-qa-id={`prefetch-${repoInfo.name}`}
            variant={preFetchedName === repoInfo.fileName ? undefined : 'secondary'}
            onClick={() => {
                setNewReportType('' as ReportType)
                getPreFetchedReport(repoInfo)
            }}
        >
            {repoInfo?.name || 'Report'}
        </Button>
    </SheetClose>
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="link" className="normal-case">Other reports</Button>
            </SheetTrigger>
            <SheetContent className="bg-background">
                <SheetHeader>
                    <SheetTitle>See a different report</SheetTitle>
                </SheetHeader>
                <div className="mb-4">
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
                    </>
                </div>
            </SheetContent>
        </Sheet>
    )
}

type State = {
    preFetchedName: string
}
const mapStateToProps = (state: State) => ({
    preFetchedName: state.preFetchedName,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    getPreFetchedReport: (info: AnyForNow) => dispatch(getPreFetched(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChooseReport)
