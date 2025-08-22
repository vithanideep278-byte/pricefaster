import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import { useNavigate } from 'react-router-dom'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { createElement } from 'react'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()


    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const resp = await apiSignIn(values)
            console.log(resp,"resp");
            
            if (resp.data) {
                const { token } = resp.data
                console.log(token,"tokentoken");
                
                dispatch(signInSuccess(token))
                if (resp.data.user) {
                    // Normalize API user fields into our UserState
                    const apiUser: any = resp.data.user
                    const normalizedUser = {
                        id: apiUser?.id ?? apiUser?._id ?? '',
                        avatar: apiUser?.avatar || apiUser?.profile_image || '',
                        userName: apiUser?.userName || apiUser?.first_name || '',
                        email: apiUser?.email || '',
                        authority: apiUser?.authority || ['USER'],
                        first_name: apiUser?.first_name || '',
                        last_name: apiUser?.last_name || '',
                        phone: apiUser?.phone || '',
                    }
                    dispatch(setUser(normalizedUser))
                }
                const anyData = resp.data as any
                const loginMessage = anyData?.message || anyData?.msg || 'Logged in successfully'

                // Show toast with API response message upon successful login (no JSX in .ts file)
                toast.push(
                    createElement(
                        Notification,
                        { type: 'success', duration: 2500, title: 'Login' },
                        loginMessage
                    ),
                    { placement: 'top-end' }
                )

                navigate('/dashboard')
                return {
                    status: 'success',
                    message: loginMessage as string,
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp.data) {
                const { token } = resp.data
                console.log(token,"tokentoken");
                
                dispatch(signInSuccess(token))
                if (resp.data.user) {
                    dispatch(
                        setUser(
                            resp.data.user || {
                                avatar: '',
                                userName: 'Anonymous',
                                authority: ['USER'],
                                email: '',
                            }
                        )
                    )
                }
                navigate('/dashboard')
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            })
        )
        toast.push(
            createElement(
                Notification,
                { type: 'success', duration: 2000, title: 'Signed out' },
                'You have been signed out'
            ),
            { placement: 'top-end' }
        )
        navigate('/sign-in')
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } catch {
            // Ignore sign out API errors and proceed to clear local session
        } finally {
            handleSignOut()
        }
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
