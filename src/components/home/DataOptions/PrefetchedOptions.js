import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import Message from '../Message'
import { P } from '../../shared/StyledTags'
import styles from './styles'
import { getPreFetched } from '../../../state/actions'
import {
    preFetchedRepos,
    preFetchedTeams,
} from '../../../preFetchedInfo'

const FetchForm = (props) => {
    const {
        classes,
        error,
        preFetchedName,
        getPreFetchedReport,
    } = props

    console.log('-=-=--preFetchedName', preFetchedName)

    const preFetchButton = ({ name, file }, i) => <Button
        value={name}
        key={i}
        color={preFetchedName === file ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedReport({ name, file })
        }}
    />
    // TODO: ajax prefetched on load? or have first in bundle
    return (
        <div className={classes.preFetched}>
            <P>
                See community contribution health of some popular Open Source repositories.
            </P>
            {
                preFetchedRepos
                    .map(preFetchButton)
            }
                {/* {
                    [
                        'react',
                        'svelte',
                        'vue-next',
                    ]
                } */}
                <P>See contribution health of some popular OSS teams</P>
                {
                    preFetchedTeams
                        .map(preFetchButton)
                }
                {
                    error
                        && <Message
                            error={error}
                            className={classes.fullRow}
                        />
                }
            </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedName: state.preFetchedName,
    error: state.error,
})

const mapDispatchToProps = dispatch => ({
    getPreFetchedReport: (x) => dispatch(getPreFetched(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))
