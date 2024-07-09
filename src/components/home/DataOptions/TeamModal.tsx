import { useState } from 'react'
import { Box, Modal} from '@mui/material'
import { withStyles, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { FetchInfo } from '../../../types/Querys'
import { UsersInfo } from '../../../types/State'
import { Users } from '../../../types/Components'

import styles from './styles'
import { H, P } from '../../shared/StyledTags'
import Button from '../../shared/Button'
import Message, { ErrorInputs } from '../Message'
import UsersForm from './UsersForm'

import TextInput from './TextInput'

import api from '../../../api/api'
import { teamIDsQuery } from '../../../api/queries'

type GetTeamMembers = {
    fetchInfo: FetchInfo
    setGitUsers: (x: UsersInfo) => void
    setInputError: (x: ErrorInputs) => void
}
const getTeamMembers = async ({fetchInfo, setGitUsers, setInputError}: GetTeamMembers) => {
    try {
        const { results = [] } = await api({
            fetchInfo,
            queryInfo: teamIDsQuery,
            dispatch: () => {},
        })

        type Node = {
            node: {
                name: string
                email: string
                login: string
            }
        }

        const usersInfo:UsersInfo = {}
        results
            .flat()
            .forEach(({ node }: Node) => {
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
    } catch (error:any) {
        setInputError({level: 'error', message: `Api call error: ${error?.message || 'unknown'}`})
    }
}

type TagStyles = {
    [key: string]: CSSProperties
}
const modalStyles = (theme: Theme): TagStyles => ({
    ...styles(theme),
    form: {
        overflow: 'scroll',
        width: '100%',
        '& > *': {
            marginBottom: '1rem',
        },
    },
    copy: {
        marginBottom: '0.2rem',
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

type GitHubTeamProps = {
    classes: any
    setGitUsers: any
}
const GitHubTeam = withStyles(modalStyles)((props:GitHubTeamProps) => {
    const {
        classes = {},
        setGitUsers,
    } = props

    const defaultError: ErrorInputs = {
        message: '',
        level: 'error',
    }
    const [inputError, setInputError] = useState(defaultError)

    const defaultInputs = {
        gitTeamUrl: '',
        token: '',
    }
    const [formInfo, setFormInfo] = useState(defaultInputs)

    const setValue = (key: string, value: string | number | object) => setFormInfo({
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
        onSubmit={(event) => {
                event.preventDefault()
                const {
                    gitTeamUrl = '',
                    token = '',
                } = formInfo

                const urlParts = gitTeamUrl.split('/')
                const name = urlParts.at(-2) || ''
                const org = urlParts.at(-2) || ''

                const isValid = [name,org,token].every(x => x && x.length > 0)

                if (isValid) {
                    getTeamMembers({ fetchInfo:{ name, org, token }, setGitUsers, setInputError})
                } else {
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

type TeamModalProps = {
    setParentValues: (x: object) => void
    usersInfo: Users
    classes: any
}
const TeamModal =  withStyles(modalStyles)(({
    setParentValues,
    usersInfo = {},
    classes = {},
}: TeamModalProps) => {
    const [open, setOpen] = useState(false)
    const handleOpen = (event:React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        setOpen(true)
    }
    const handleClose = () => setOpen(false)

    const [gitUsers, setGitUsers] = useState([] as string[])

    return (<div>
        <P className={classes.copy}>
            Team members: { Object.values(usersInfo).map(({ name, userId }) => name || userId).join(', ') || 'None'}
        </P>
        <Button
            className={classes.fullWidth}
            type="button"
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
                    onSubmit={(updatedUsersInfo: object) => {
                        const hasFormValues = Object.keys(updatedUsersInfo).filter(Boolean).length > 0
                        if (hasFormValues) {
                            setParentValues({ usersInfo: updatedUsersInfo })
                        } else {
                            setParentValues({ usersInfo: {} })
                        }
                        handleClose()
                    }}
                />
            </Box>
        </Modal>
    </div>)
  })

  export default TeamModal
