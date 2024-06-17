

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
                    <H level={1}>Code Health</H>
                )}
            />
            <P>Coding is a team activity, healthy collaboration produces better code. This tool gives in depth collaboration and contribution metrics for teams to analyze their code health.</P>
            <P>You can create your own reports for individuals, teams, repos and orgs from public or enterprise GitHub.</P>
        </Paper>
        <>
            <DataOptions />
            <Visualisation />
        </>
    </PageWrapper>
)

export default Page
