

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
            />
            <P>Coding is a team activity, healthy collaboration produces better code, this tool gives in depth contribution and collaboration metrics for teams to analyze their code health.</P>
            <P>This is built for teams as an aid for continuous improvement, it will show trend changes as they experiment with new ways of working. It is not a 'lines of code' metric, it contains in depth contribution based metrics meant to help teams find good and bad trends.</P>
            <P>You can create your own reports for individuals, teams, repos and orgs from public or enterprise GitHub. I have added some reports from some popular repos and orgs as an example.</P>
        </Paper>
        <>
            <DataOptions />
            <Visualisation />
        </>
    </PageWrapper>
)

export default Page
