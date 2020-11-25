import React from 'react'

import { H, P } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'

const RepoDescription = ({ repoInfo } = {}) => {
    const {
        org,
        repo,
        description = 'Unknown',
        sdlc,
    } = repoInfo
    // colors = { ['#1f77b4', '#e82573']}

    return repo && org
        ? (
            <Paper>
                <ChartDescription
                    title={(
                        <H level={2}>
                            {
                                org === repo
                                    ? (
                                        <span style={{ color: '#e82573' }}>{repo}</span>
                                    )
                                    : (
                                        <>
                                            <span style={{ color: '#1f77b4' }}>{org}</span>/<span style={{ color: '#e82573' }}>{repo}</span>
                                        </>
                                    )
                            }
                        </H>
                    )}
                    intro={description}
                >
                    <H level={4}>Software Delivery Life Cycle (SDLC):</H>
                    <P>{sdlc || 'Unknown'}</P>
                </ChartDescription>
            </Paper>
        )
        : null
}

export default RepoDescription

