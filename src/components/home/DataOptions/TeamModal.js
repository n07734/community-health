import { useState } from 'react'
import { Box, Modal, withStyles} from '@material-ui/core'

import styles from './styles'
import { H } from '../../shared/StyledTags'
import Button from '../../shared/Button'
import Message from '../Message'
import UsersForm from './UsersForm'

import TextInput from './TextInput'

import api from '../../../api/api'
import { teamIDsQuery } from '../../../api/queries'

const getTeamMembers = async ({fetchInfo = {}, setGitUsers, setInputError}) => {
    try {
        const { results = [] } = await api({
            fetchInfo,
            queryInfo: teamIDsQuery,
        })

        const usersInfo = {}
        results
            .flat()
            .forEach(({ node } = {}) => {
                const {
                    name,
                    email,
                    login,
                } = node

                const nameString = name
                    ? name.replace(',', '')
                    : email.split('.')[0]

                usersInfo[login] = {
                    userId: login,
                    name: nameString,
                }
            })
        setGitUsers(usersInfo)
    } catch (error) {
        setInputError({level: 'error', message: `Api call error: ${error?.message || 'unknown'}`})
    }
}

const modalStyles = theme => ({
    ...styles(theme),
    form: {
        overflow: 'scroll',
        width: '100%',
        '& > *': {
            marginBottom: '1rem',
        },
    },
    fullWidth: {
        width: '100%',
        margin: 0,
    },
    wrap: {
        position: 'absolute',
        maxHeight: '100%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        backgroundColor: theme.palette.background.default,
        padding: '1.5rem 1.5rem 0 1.5rem',
        overflow: 'scroll',
    },
})

const GitHubTeam = withStyles(modalStyles)((props) => {
    const {
        classes = {},
        setGitUsers,
    } = props

    const defaultInputs = {
        gitTeamUrl: '',
        token: '',
    }
    const [inputError, setInputError] = useState({})
    const [formInfo, setFormInfo] = useState(defaultInputs)

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

    return (<form
        className={classes.form}
        onSubmit={async(event) => {
                event.preventDefault()
                console.log('formInfo', formInfo)
                const {
                    gitTeamUrl = '',
                    token = '',
                } = formInfo

                const urlParts = gitTeamUrl.split('/')
                const name = urlParts.at(-2)
                const org = urlParts.at(-2)

                const isValid = [name,org,token].every(x => x && x.length > 0)

                if (isValid) {
                    getTeamMembers({ fetchInfo:{ name, org, token }, setGitUsers, setInputError})
                } else {
                console.log('fff')

                    setInputError({level: 'error', message: 'Invalid inputs'})
                }
        }}
    >
        <H level={4}>Get team members from a GitHub Org team page</H>
        <TextInput
            key='gitTeamUrl'
            type='gitTeamUrl'
            { ...inputStates }
        />
        <TextInput
            type="token"
            { ...inputStates }
        />
        <Button
            className={classes.button}
            value="Get team members"
            type="submit"
        />
        {
            inputError?.message?.length > 0
                && <Message
                    error={inputError}
                />
        }
    </form>)
})

const TeamModal =  withStyles(modalStyles)(({
    setParentValues,
    usersInfo = {},
    classes = {},
} = {}) => {
    const [open, setOpen] = useState(false)
    const handleOpen = (event) => {
        event.preventDefault()
        setOpen(true)
    }
    const handleClose = () => setOpen(false)

    const [gitUsers, setGitUsers] = useState([])

    return (<div>
        <Button
            className={classes.fullWidth}
            type="text"
            value={
                Object.keys(usersInfo).length === 0
                    ? 'Add team members'
                    : 'Edit team members'
            }
            onClick={handleOpen}
        />
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Box className={classes.wrap}>
                {
                    Object.keys(usersInfo).length === 0
                        && <GitHubTeam setGitUsers={setGitUsers} />
                }
                <UsersForm
                    gitUsers={gitUsers}
                    usersInfo={usersInfo}
                    onSubmit={(x) => {
                        const xString = JSON.stringify(x)
                        console.log('xString', xString)
                        setParentValues({userIds: xString, usersInfo: x})
                        handleClose()
                    }}
                />
            </Box>
        </Modal>
    </div>)
  })

  export default TeamModal
