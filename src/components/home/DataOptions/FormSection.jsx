import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import ChartDescription from '../../shared/ChartDescription'
import SelectAmountData from './SelectAmountData'
import ButtonWithMessage from './ButtonWithMessage'
import TeamModal from './TeamModal'
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
    storeUsersInfo,
    storeTeamName,
    storeEnterpriseAPI,
    storeExcludeIds,
    storeEvents,
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

    const titles = {
        repo: 'Get community data for any repo',
        team: 'Get community data for any Team(list of users)',
        user: 'Get data for an individual',
        org: 'Get community data for any Org',
    }
    const formTitle = titles[reportType]

    const reportTypeInputsHash = {
        repo: {
            org: '',
            repo: '',
        },
        org: {
            org: '',
        },
        team: {
            usersInfo: {},
            teamName: '',
        },
        user: {
            userId: '',
            name: '',
        },
    }
    const reportInputs = reportTypeInputsHash[reportType]

    const defaultInputs = {
        ...commonInputs,
        ...reportInputs,
    }

    const [inputError, setInputError] = useState({})
    const [formInfo, setFormInfo] = useState(defaultInputs)

    const setFormValues = (newValues = {}) => {
        const updatedInfo = {
            ...formInfo,
            ...newValues,
        }

        setFormInfo(updatedInfo)
    }

    useEffect(() => {
        setFormInfo(defaultInputs)
    }, [reportType, setFormInfo])


    const setValue = (key, value) => setFormInfo({
        ...formInfo,
        [key]: value,
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

    const inputsHash = {
        repo: [
            {type:'org'},
            {type:'repo'},
        ],
        org: [
            {type:'org', className: 'inputDesc'},
        ],
        team: [
            {type:'teamName', className: 'inputDesc'},
        ],
        user: [
            {type:'userId'},
            {type:'name'},
        ],
    }
    const inputs = inputsHash[reportType]

    return (
        <div className={classes.formDescription} >
            <H level={3}>{formTitle}</H>
            <form
                onSubmit={handleSubmit}
            >
                <div className={classes.inputGrid}>
                    {
                        inputs
                            .map((input = {}) => <TextInput
                                className={input.className}
                                key={input.type}
                                type={input.type}
                                { ...inputStates }
                            />)
                    }
                    {
                        reportType === 'team' &&
                            <TeamModal
                                usersInfo={formInfo.usersInfo}
                                setParentValues={setFormValues}
                            />
                    }
                    <TextInput
                        className="inputDesc"
                        type='events'
                        { ...inputStates }
                    />
                    <P className="inputDesc">
                        Key events can give context when viewing the data e.g. started using copilot, launched a feature. These events can help give more context while viewing the data. e.g.  Copilot adopted=2024-02-01,Feature A=2024-04-10.
                    </P>
                    <TextInput
                        type="token"
                        { ...inputStates }
                    />
                    <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                    <P className="inputDesc">
                        To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on &#39;generate new token&#39;, choose the settings &#39;repo&#39; (all), &#39;read:org&#39; and &#39;user&#39; then click &#39;Generate token&#39;.
                    </P>
                </div>

                <ChartDescription
                    className={`${classes.formDescription} ${classes.fullRow}`}
                    expandText="show"
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
            usersInfo = {},
            userId,
            name,
            enterpriseAPI,
            excludeIds,
            events,
        } = values

        if (userId) {
            usersInfo[userId] = {
                userId,
                name,
            }
        }

        dispatch(clearPastSearch({
            ...values,
            usersInfo,
        }))

        dispatch(storeToken(token))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(sortDirection))
        dispatch(storeFormUntilDate(amountOfData))

        org && dispatch(storeOrg(org))
        repo && dispatch(storeRepo(repo))
        userIds && dispatch(storeUserIds(userIds))
        Object.keys(usersInfo).length > 0 && dispatch(storeUsersInfo(usersInfo))
        teamName && dispatch(storeTeamName(teamName))

        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeExcludeIds(excludeIds))
        events && dispatch(storeEvents(events))
    },
    getData: (x) => dispatch(getAPIData(x)),
})

export default connect(mapStateToProps,
    mapDispatchToProps)(withStyles(styles)(FormSection))