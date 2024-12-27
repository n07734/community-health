import { connect } from 'react-redux'
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ReportType, AnyForLib } from "@/types/State"
import { clearAllData } from '@/state/actions'

const allTypes: [string, ReportType][] = [
    ['Individual report', 'user'],
    ['Team report', 'team'],
    ['Repo report', 'repo'],
    ['Org report', 'org'],
]

type MakeReportProps = {
    setNewReportType: (type: ReportType) => void,
    clearReport: () => void,
}
const MakeReport = ({ setNewReportType, clearReport }: MakeReportProps) => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="link" className='normal-case text-report-title hover:text-primary text-base'>Make a report</Button>
        </SheetTrigger>
        <SheetContent className="bg-background">
            <SheetHeader>
                <SheetTitle>Make a report</SheetTitle>
                <SheetDescription>
                    Choose the type of report you want to make
                </SheetDescription>
            </SheetHeader>
            <div>
                {
                    allTypes
                        .map(([text, type], i: number) => <SheetClose
                            key={`${i}`}
                            asChild>
                            <Button
                                className="text-xl normal-case mr-2 mb-3 w-full"
                                variant="secondary"
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('report');
                                    history.pushState(null, '', url);
                                    clearReport()
                                    setNewReportType(type)
                                }}
                            >
                                {text}
                            </Button>
                        </SheetClose>)
                }
            </div>
        </SheetContent>
    </Sheet>
)

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    clearReport: () => dispatch(clearAllData),
})

export default connect(() => ({}), mapDispatchToProps)(MakeReport)

