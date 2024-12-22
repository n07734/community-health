import Paper from '@/components/shared/Paper'
import FormSection from './DataOptions/FormSection'
import { ReportType } from '@/types/State'

type FetchFormProps = {
    newReportType: ReportType,
}
const  NewReport = ({ newReportType }: FetchFormProps) => {

    return (
        <Paper className="block">
            <FormSection reportType={newReportType} />
        </Paper>
    )
}

export default NewReport