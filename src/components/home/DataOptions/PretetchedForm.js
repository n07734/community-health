import React, { useState } from 'react'
import { connect } from 'react-redux'
import { pick } from 'ramda'
import {
    Select,
    MenuItem,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import ButtonWithMessage from './ButtonWithMessage'
import SelectAmountData from './SelectAmountData'
import TextInput from './TextInput'

import Download from './Download'
import ChartDescription from '../../shared/ChartDescription'
import { P } from '../../shared/StyledTags'
import styles from './styles'
import {
    inputLabels,
    formValue,
    validateForm,
} from './utils'

import {
    storeToken,
    storeAmountOfData,
    storeFormUntilDate,
    storeSortDirection,
    getAPIData,
    getDownloadProps,
    checkUntilDate,
} from '../../../state/actions'

const PrefetchedForm = (props) => {
    const {
        setValues,
        getData,
        fetches = {},
        fetching,
        classes,
        userIds = [],
    } = props

    const reportType = userIds.length > 0
        ? 'team'
        : 'repo'

    const inputKeys = [
        'sortDirection',
        'amountOfData',
        'token',
    ]

    const inputs = pick(inputKeys, fetches)

    const [formInfo, setFormInfo] = useState(inputs)
    const [inputError, setInputError] = useState({})

    const setValue = (key, value) => setFormInfo({
        ...formInfo,
        [key]: value
    })

    const inputStates = {
        inputError,
        setInputError,
        formInfo,
        setValue,
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const {
            isValid,
            validationErrors,
        } = validateForm(formInfo)

        setInputError(validationErrors)

        isValid && !fetching
            && setValues(formInfo)

        isValid && !fetching
            && getData()
    }

    const reportKeys = reportType === 'repo'
        ? ['org', 'repo']
        : ['userIds', 'teamName']

    const hardCodedKeys = [
        ...reportKeys,
        'excludeIds',
        'enterpriseAPI',
    ]

    return (
        <ChartDescription
            className={`${classes.formDescription} ${classes.fullRow}`}
            title=""
            expandText="here"
            intro="Top up this report's data"
        >
            <div className={classes.formDescription} >
                <form
                    onSubmit={handleSubmit}
                >
                    <div className={classes.inputGrid}>
                        <Select
                            value={formInfo.sortDirection}
                            onChange={(e) => setValue('sortDirection', e.target.value)}
                            inputProps={{ 'aria-label': 'Starting point' }}
                        >
                            <MenuItem value="DESC" >Prepend data</MenuItem>
                            <MenuItem value="ASC">Append data</MenuItem>
                        </Select>
                        <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                        <TextInput
                            type="token"
                            { ...inputStates }
                        />
                        <P className="inputDesc">
                            * To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all) and 'read:org' then click 'Generate token'.
                        </P>
                        {
                            hardCodedKeys
                                .filter((inputKey) => formValue(fetches, inputKey))
                                .map((inputKey) => <P key={inputKey}>{inputLabels[inputKey]}: <b>{formValue(fetches, inputKey) || 'N/A'}</b></P>)
                        }
                    </div>
                    <ButtonWithMessage />
                </form>
                <Download />
            </div>
        </ChartDescription>
    )
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    userIds: state.fetches.userIds,
})

const mapDispatchToProps = dispatch => ({
    setValues: (values) => {
        const {
            token,
            amountOfData,
            sortDirection
        } = values

        dispatch(checkUntilDate(sortDirection))
        dispatch(storeToken(token))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(sortDirection))
        dispatch(storeFormUntilDate(amountOfData))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps,
    mapDispatchToProps)(withStyles(styles)(PrefetchedForm))
