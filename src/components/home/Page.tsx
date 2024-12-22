

import { useState } from 'react'
import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'
import Visualisation from './Visualisation'
import Links from './Links'
import MakeReport from './Nav/MakeReport'
import ChooseReport from './Nav/ChooseReport'
import PrefetchedReport from './DataOptions/PrefetchedReport'
import FormSection from './DataOptions/FormSection'
import { ReportType } from '@/types/State'

const Page = () => {
    const [newReportType, setNewReportType] = useState<ReportType | ''>('')

    return (
        <div className="p-0 overflow-auto">
            <header>
                <nav className="w-full flex flex-wrap">
                    <ChooseReport setNewReportType={setNewReportType} />
                    <MakeReport setNewReportType={setNewReportType} />
                    <Links />
                </nav>  <Paper>
                    <ChartDescription
                        title="Code Health"
                        hLevel={1}
                        expandText="more"
                    >
                        <p>Coding is a team activity, healthy collaboration produces better code. This tool gives in depth collaboration and contribution metrics for teams to analyze their code health.</p>
                        <p>You can create your own reports for individuals, teams, repos and orgs from public or enterprise GitHub.</p>
                    </ChartDescription>

                </Paper>
            </header>
            <PrefetchedReport />
            {
                newReportType !== '' && <Paper className="block">
                    <FormSection reportType={newReportType} />
                </Paper>
            }
            <Visualisation />
        </div>
    )
}

export default Page
