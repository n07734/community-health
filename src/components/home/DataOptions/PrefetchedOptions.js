import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import { P } from '../../shared/StyledTags'
import styles from './styles'
import { getPreFetchedData } from '../../../state/actions'

const FetchForm = (props) => {
    const {
        classes,
        preFetchedRepo,
        getPreFetchedRepo,
    } = props

    return (
        <div className={classes.preFetched}>
                <P>
                    See community contribution health of some popular Open Source repositories.
                </P>
                {
                    [
                        'react',
                        'svelte',
                        'vue-next',
                        'TypeScript',
                        'material-ui',
                        'xstate',
                        'react-testing-library',
                        'node',
                        'deno',
                        'vscode',
                        'electron',
                        'kotlin',
                        'swift',
                        'ramda',
                        'babel',
                        'jest',
                        'prettier',
                        'cypress',
                    ]
                        .map((repo, i) => <Button
                            value={repo}
                            key={i}
                            color={preFetchedRepo === repo ? 'primary' : 'secondary'}
                            onClick={(e) => {
                                e.preventDefault()
                                getPreFetchedRepo(repo)
                            }}
                        />)
                }
            </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedRepo: state.preFetchedRepo,
})

const mapDispatchToProps = dispatch => ({
    getPreFetchedRepo: (x) => dispatch(getPreFetchedData(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))
