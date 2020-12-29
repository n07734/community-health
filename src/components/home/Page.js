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
                    <H level={1}>Code Contribution Health</H>
                )}
                intro="The aim of this tool is to help teams learn from their contribution trends. Also to see the contribution trends of popular repositories*"
            >
                <div>
                    <P>This tool is not a 'lines of code' like metric, it contains in depth contribution based metrics meant to help teams find good and bad trends. Also helps show if changes to ways of working have an impact on important metrics over time. Understanding of the team's way of working is needed to get the full value from this data.</P>
                    <P>Context is king, data that looks 'good' might be 'bad' and data that looks 'bad' might be 'good'. For example little feedback in PRs may be expected if the team is doing small changes in an established code base or not getting enough feedback working on a greenfield project.</P>
                    <P>The sections below have some pointers to look out for, these are meant as guides as team context is needed to know what the data is truly showing.</P>
                    <P>* If you contribute to any of the open source repositories it would be great if you could open a pull request to describe what software delivery life cycle is and maybe what learnings that were made to get there. This could help others see how it impacts contributions and maybe adopt some of the practices.</P>
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
