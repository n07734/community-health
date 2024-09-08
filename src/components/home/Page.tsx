

import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'
import DataOptions from './DataOptions'
import Visualisation from './Visualisation'
import Links from './Links'

const Page = () => (
    <div className="p-0 overflow-auto">
        <Paper className="bg-none">
            <Links />
            <ChartDescription
                title={(
                    <h1>Code Health</h1>
                )}
            />
            <p>Coding is a team activity, healthy collaboration produces better code. This tool gives in depth collaboration and contribution metrics for teams to analyze their code health.</p>
            <p>You can create your own reports for individuals, teams, repos and orgs from public or enterprise GitHub.</p>
        </Paper>
        <>
            <DataOptions />
            <Visualisation />
        </>
    </div>
)

export default Page
