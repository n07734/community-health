

import { H, P } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'
import DataOptions from './DataOptions'
import Visualisation from './Visualisation'
import PageWrapper from './PageWrapper'
import Links from './Links'

const Page = () => (
    <PageWrapper>
        <Paper className="bg-none">
            <Links />
            <ChartDescription
                title={(
                    <H level={1}>Code Community Health</H>
                )}
                intro="Coding is a team activity, healthy collaboration produces better code, this tool gives in depth contribution and collaboration metrics for teams to analyze their code health. You can create your own reports for repos and teams from public or enterprise GitHub. I have added reports of some popular repos as an example."
            >
                <div>
                    <P>This tool is not a 'lines of code' metric or focused on individual user's metrics, it contains in depth contribution based metrics meant to help teams find good and bad trends. Also helps show if changes to ways of working have an impact over time. Understanding of the team's way of working is needed to get the full value from this data.</P>
                </div>
            </ChartDescription>
        </Paper>
        <>
            <DataOptions />
            <Visualisation />
        </>
    </PageWrapper>
)

export default Page
