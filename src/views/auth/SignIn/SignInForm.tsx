import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
    signUpUrl?: string
}

type SignInFormSchema = {
    email: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Please enter a valid email').required('Please enter your email address'),
    password: Yup.string().required('Please enter your password'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        forgotPasswordUrl = '/forgot-password',
        signUpUrl = '/sign-up',
    } = props

    const [message, setMessage] = useTimeOutMessage()
    const [showPassword, setShowPassword] = useState(false)

    const { signIn } = useAuth()

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { email, password } = values
        setSubmitting(true)

        const result = await signIn({ email, password })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                    rememberMe: true,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignIn(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                className='mb-[34px]'
                                label={
                                    <>
                                        Email Address <span className="ml-[5px] text-red-500 relative top-[-3px]">*</span>
                                    </>
                                }
                                labelClass="text-white"
                                invalid={
                                    (errors.email &&
                                        touched.email) as boolean
                                }
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Enter your email address"
                                    component={Input}
                                    className="rounded-[18px] border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)]"
                                />
                            </FormItem>
                            <FormItem
                                className='mb-0'
                                label={
                                    <>
                                        Password <span className="ml-[5px] text-red-500 relative top-[-3px]">*</span>
                                    </>
                                }
                                labelClass="text-white"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
                                }
                                errorMessage={errors.password}
                            >
                                <div className="relative">
                                    <Field
                                        autoComplete="off"
                                        name="password"
                                        placeholder="Enter your password"
                                        component={Input}
                                        type={showPassword ? "text" : "password"}
                                        className="rounded-[18px] border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] mb-[11px] pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-[40%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={20} />
                                        ) : (
                                            <FiEye size={20} />
                                        )}
                                    </button>
                                </div>
                            </FormItem>
                            <div className="flex justify-end mb-[27px]">
                                <ActionLink
                                    to={forgotPasswordUrl}
                                    className="text-white text-[14px] font-normal font-nunito "
                                >
                                    Forgot Password?
                                </ActionLink>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="!bg-[#4880FF] pb-[34px] text-white !rounded-[18px] py-3 text-base font-medium"
                            >
                                {isSubmitting ? 'Continue' : 'Continue'}
                            </Button>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
