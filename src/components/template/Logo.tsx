import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline' | 'pricefaster'
    mode?: 'light' | 'dark' | 'pricefaster'
    imgClass?: string
    logoWidth?: number | string
    collapsed?: boolean
}

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
        collapsed = false,
    } = props

    // Custom PriceFaster logo with specific styling
    if (type === 'pricefaster') {
        return (
            <div
                className={classNames('logo', className)}
                style={{
                    ...style,
                    ...{ width: logoWidth },
                    padding: collapsed ? '19px 26px 16px' : '23px 37px 16px 24px'
                }}
            >
                <div className="flex items-center">
                    <img
                        src="/img/images/sidbarlogo.svg"
                        alt="PriceFaster Logo"
                        className={classNames('w-8 h-8 object-contain', imgClass)}
                    />
                    {!collapsed && (
                        <div className="ml-3 flex items-center">
                            <span 
                                className="font-poppins font-normal leading-tight tracking-tight text-gray-800"
                                style={{ fontSize: '28px' }}
                            >
                                Price
                            </span>
                            <span 
                                className="font-poppins font-bold leading-tight tracking-tight text-gray-800"
                                style={{ fontSize: '28px' }}
                            >
                                Faster
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img
                className={imgClass}
                src={`${LOGO_SRC_PATH}logo-${mode}-${type}.png`}
                alt={`${APP_NAME} logo`}
            />
        </div>
    )
}

export default Logo
