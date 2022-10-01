import React from 'react'

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
                intro="The aim of this tool is to help teams learn from their contribution trends. Also to see the contribution trends of popular repositories and teams"
            >
                <div>
                    <P>This tool is not a 'lines of code' metric, it contains in depth contribution based metrics meant to help teams find good and bad trends. Also helps show if changes to ways of working have an impact over time. Understanding of the team's way of working is needed to get the full value from this data.</P>
                    <P>Context is king, data that looks 'good' might be 'bad' and data that looks 'bad' might be 'good'. For example little feedback in PRs may be expected if the team is doing small changes in an established code base or not getting enough feedback working on a greenfield project.</P>
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
