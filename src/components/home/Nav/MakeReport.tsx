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
import { ReportType } from "@/types/State"
import { resetStateToInitialState } from "@/state/fetch"

const allTypes: [string, ReportType][] = [
    ['Individual report', 'user'],
    ['Team report', 'team'],
    ['Repo report', 'repo'],
    ['Org report', 'org'],
]

type MakeReportProps = {
    setNewReportType: (type: ReportType) => void,
}
const MakeReport = ({ setNewReportType }: MakeReportProps) => (
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
                                    resetStateToInitialState()
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

export default MakeReport
