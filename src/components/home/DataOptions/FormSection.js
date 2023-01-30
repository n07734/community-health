import React, { useState } from 'react'
import { connect } from 'react-redux'
import { keys } from 'ramda'
import { withStyles } from '@material-ui/core/styles'

import ChartDescription from '../../shared/ChartDescription'
import SelectAmountData from './SelectAmountData'
import ButtonWithMessage from './ButtonWithMessage'
import TextInput from './TextInput'

import Download from './Download'
import { P, H } from '../../shared/StyledTags'
import styles from './styles'
import { validateForm } from './utils'

import {
    clearPastSearch,
    storeOrg,
    storeRepo,
    storeToken,
    storeUserIds,
    storeTeamName,
    storeEnterpriseAPI,
    storeExcludeIds,
    storeAmountOfData,
    storeFormUntilDate,
    storeSortDirection,
    getAPIData,
} from '../../../state/actions'

const FormSection = (props) => {
    const {
        setValues,
        getData,
        fetching,
        reportType = 'repo',
        classes,
    } = props

    const commonInputs = {
        sortDirection: 'DESC',
        amountOfData: 1,
        token: '',
        excludeIds: '',
        enterpriseAPI: '',
    }

    const formTitle = reportType === 'repo'
        ? 'Get community data for any repo'
        : 'Get community data for any Team(list of users)'

    const primaryInputs = reportType === 'repo'
        ? {
            org: '',
            repo: '',
        }
        : {
            userIds: '',
            teamName: '',
        }

    const defaultInputs = {
        ...commonInputs,
        ...primaryInputs,
    }

    const [inputError, setInputError] = useState({})
    const [formInfo, setFormInfo] = useState(defaultInputs)

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

    return (
        <div className={classes.formDescription} >
            <H level={3}>{formTitle}</H>
            <form
                onSubmit={handleSubmit}
            >
                <div className={classes.inputGrid}>
                    <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                    {
                        reportType === 'repo'
                            ? <>
                                <TextInput
                                    key='org'
                                    type='org'
                                    { ...inputStates }
                                />
                                <TextInput
                                    key='repo'
                                    type='repo'
                                    { ...inputStates }
                                />
                            </>
                            : <>
                                <TextInput
                                    key='userIds'
                                    type='userIds'
                                    { ...inputStates }
                                />
                                <P className="inputDesc">
                                    You can also define the start and/or end date for a user in the team e.g. userA=start:2023-01,userB=start:2020-01end:2022-12.
                                </P>
                                <TextInput
                                    key='teamName'
                                    type='teamName'
                                    { ...inputStates }
                                />
                            </>
                    }
                    <TextInput
                        type="token"
                        { ...inputStates }
                    />
                    <P className="inputDesc">
                        To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all) and 'read:org' then click 'Generate token'.
                    </P>
                </div>

                <ChartDescription
                    className={`${classes.formDescription} ${classes.fullRow}`}
                    title=""
                    expandText="add this"
                    intro="Advanced options"
                >
                    <div className={classes.inputGrid}>
                        <TextInput
                            type="excludeIds"
                            { ...inputStates }
                        />
                        <TextInput
                            type="enterpriseAPI"
                            { ...inputStates }
                        />
                    </div>
                </ChartDescription>

                <ButtonWithMessage />
            </form>
            <Download />
        </div>
    )
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    error: state.error,
})

const mapDispatchToProps = dispatch => ({
    setValues: (values) => {
        const {
            org,
            repo,
            token,
            amountOfData,
            sortDirection,
            teamName,
            userIds,
            enterpriseAPI,
            excludeIds,
        } = values

        dispatch(clearPastSearch(values))

        dispatch(storeToken(token))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(sortDirection))
        dispatch(storeFormUntilDate(amountOfData))

        org && dispatch(storeOrg(org))
        repo && dispatch(storeRepo(repo))
        userIds && dispatch(storeUserIds(userIds))
        teamName && dispatch(storeTeamName(teamName))

        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeExcludeIds(excludeIds))
    },
    getData: (x) => dispatch(getAPIData(x)),
})

export default connect(mapStateToProps,
    mapDispatchToProps)(withStyles(styles)(FormSection))
