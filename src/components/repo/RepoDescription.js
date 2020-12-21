import React from 'react'

import { H, P } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import Paper from '../shared/Paper'

const Sdlc = ({ sdlc }) => (
    <>
        <H level={4}>Software Delivery Life Cycle (SDLC):</H>
        <P>{sdlc}</P>
    </>
)

const RepoDescription = ({ repoInfo } = {}) => {
    const {
        org,
        repo,
        description = 'Unknown',
        sdlc,
    } = repoInfo

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
                    {
                        sdlc && sdlc !== 'Unkown'
                            && <Sdlc sdlc={sdlc} />
                    }
                </ChartDescription>
            </Paper>
        )
        : null
}

export default RepoDescription

