import { useState } from 'react'
import { ApiFetchInfo } from '@/types/Queries'
import { UserInfo, UsersInfo } from '@/types/State'

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'
import Button from '@/components/shared/Button'
import Message, { ErrorInputs } from '@/components/home/Message'
import UsersForm from './UsersForm'

import TextInput from './TextInput'

import api from '@/api/api'
import { teamIDsQuery } from '@/api/queries'

type GetTeamMembers = {
    fetchInfo: ApiFetchInfo
    setGitUsers: (arg: UserInfo[]) => void
    setInputError: (arg:Record<string, string>) => void
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

        const usersInfo:UserInfo[] = []
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

                usersInfo.push({
                    userId: login,
                    name: nameString,
                })
            })
        setGitUsers(usersInfo)
    } catch (err) {
        type CatchError = {
            message?: string
        }
        const error = err as CatchError
        setInputError({level: 'error', message: `Api call error: ${error?.message || 'unknown'}`})
    }
}

type GitHubTeamProps = {
    setGitUsers: (arg: UserInfo[]) => void
}
const GitHubTeam = (props:GitHubTeamProps) => {
    const {
        setGitUsers,
    } = props

    const [inputError, setInputError] = useState({})

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
        <h4>Get team members from a GitHub Org team page</h4>
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
            className="w-full mr-0 min-h-12"
            value="Get team members"
            type="submit"
        />
        {
            (inputError as ErrorInputs)?.message?.length > 0
                && <Message
                    error={inputError as ErrorInputs}
                />
        }
    </form>)
}

type TeamModalProps = {
    setParentValues: (x: object) => void
    usersInfo: UsersInfo
}
const TeamModal =  ({
    setParentValues,
    usersInfo = {},
}: TeamModalProps) => {
    const [open, setOpen] = useState(false);

    const [gitUsers, setGitUsers] = useState([] as UserInfo[])

    return (<div>
        <p>
            Team members: { Object.values(usersInfo).map(({ name, userId }) => name || userId).join(', ') || 'None'}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full"
                    type="button"
                    value={
                        Object.keys(usersInfo).length === 0
                            ? 'Add team members'
                            : 'Edit team members'
                    }
                />
            </DialogTrigger>
            <DialogContent className="overflow-scroll max-h-full w-4/5">
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
                        setOpen(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    </div>)
}

export default TeamModal
