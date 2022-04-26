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
        preFetchedName,
        getPreFetchedInfo,
    } = props

    const preFetchButton = (name, i) => <Button
        value={name}
        key={i}
        color={preFetchedName === name ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedInfo(name)
        }}
    />

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
                        .map(preFetchButton)
                }
                <P>See contribution health of some popular OSS teams</P>
                {
                    [
                        'ReactCore',
                    ]
                        .map(preFetchButton)
                }
            </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedName: state.preFetchedName,
})

const mapDispatchToProps = dispatch => ({
    getPreFetchedInfo: (x) => dispatch(getPreFetchedData(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))
