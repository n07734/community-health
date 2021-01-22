import React from 'react'

import { H } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'

const RepoDescription = ({ repoInfo, preFetchedRepo } = {}) => {
    const {
        org,
        repo,
        description,
    } = repoInfo

    return !preFetchedRepo && repo && org
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
                </ChartDescription>
            </Paper>
        )
        : null
}

export default RepoDescription

