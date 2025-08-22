import SignInForm from './SignInForm'

const SignIn = () => {
    console.log('SignIn component rendered')
    
    return (
        <>
            <div className="mb-6 sm:mb-8">
                {/* PriceFaster Logo */}
                <div className="flex items-center mb-4 sm:mb-6">
                   <img src="/img/images/loginlogo.png" alt="PriceFaster Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-10 lg:h-10 object-contain" />
                    <div className="ml-2 sm:ml-3 md:ml-4 flex items-center">
                        <span className="text-white font-poppins font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight">Price</span>
                        <span className="text-white font-poppins font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight">Faster</span>
                    </div>
                </div>
                {/* Welcome message */}
                <h3 className="text-white font-[700] text-[16px] sm:text-[18px] md:text-[17px] lg:text-[22px] mb-2 sm:mb-3 md:mb-[14px] font-nunito">Welcome Back To Price Faster</h3>
                <p className="text-white font-nunito text-xs sm:text-sm font-normal leading-tight sm:leading-none">We are happy to see you again.</p>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
