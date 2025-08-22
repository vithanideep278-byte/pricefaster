import classNames from 'classnames'
import ScrollBar from '@/components/ui/ScrollBar'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    NAV_MODE_DARK,
    NAV_MODE_THEMED,
    NAV_MODE_TRANSPARENT,
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import Logo from '@/components/template/Logo'
import navigationConfig from '@/configs/navigation.config'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useAppSelector } from '@/store'
import { useEffect, useRef, useState } from 'react'

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

// Active Indicator Component
const ActiveIndicator = ({ collapsed, sideNavRef, currentRouteKey }: { 
    collapsed: boolean; 
    sideNavRef: React.RefObject<HTMLDivElement>;
    currentRouteKey: string;
}) => {
    const [indicatorStyle, setIndicatorStyle] = useState({
        top: 0,
        height: 0,
        opacity: 0,
    })

    useEffect(() => {
        const updateIndicatorPosition = () => {
            if (sideNavRef.current && !collapsed) {
                const activeMenuItem = sideNavRef.current.querySelector('.menu-item-active')
                if (activeMenuItem) {
                    const navRect = sideNavRef.current.getBoundingClientRect()
                    const itemRect = activeMenuItem.getBoundingClientRect()
                    
                    setIndicatorStyle({
                        top: itemRect.top - navRect.top,
                        height: itemRect.height,
                        opacity: 1,
                    })
                } else {
                    setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
                }
            } else {
                setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
            }
        }

        updateIndicatorPosition()
        window.addEventListener('resize', updateIndicatorPosition)
        
        // Update position after a short delay to ensure DOM is ready
        const timeoutId = setTimeout(updateIndicatorPosition, 100)
        
        return () => {
            window.removeEventListener('resize', updateIndicatorPosition)
            clearTimeout(timeoutId)
        }
    }, [collapsed, sideNavRef, currentRouteKey]) // Added currentRouteKey as dependency

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: indicatorStyle.top,
                width: '3px',
                height: '40px',
                backgroundColor: '#4880FF',
                borderRadius: '0 2px 2px 0',
                opacity: indicatorStyle.opacity,
                transition: 'all 0.2s ease-in-out',
                zIndex: 10,
            }}
        />
    )
}

const SideNav = () => {
    const themeColor = useAppSelector((state) => state.theme.themeColor)
    const primaryColorLevel = useAppSelector(
        (state) => state.theme.primaryColorLevel
    )
    const navMode = useAppSelector((state) => state.theme.navMode)
    const mode = useAppSelector((state) => state.theme.mode)
    const direction = useAppSelector((state) => state.theme.direction)
    const currentRouteKey = useAppSelector(
        (state) => state.base.common.currentRouteKey
    )
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse
    )
    const userAuthority = useAppSelector((state) => state.auth.user.authority)

    const { larger } = useResponsive()
    const sideNavRef = useRef<HTMLDivElement>(null)

    const sideNavColor = () => {
        // Force white background for PriceFaster theme
        return 'bg-white side-nav-light'
    }

    const logoMode = () => {
        if (navMode === NAV_MODE_THEMED) {
            return NAV_MODE_DARK
        }

        if (navMode === NAV_MODE_TRANSPARENT) {
            return mode
        }

        if (navMode === 'pricefaster') {
            return 'light'
        }

        return navMode
    }

    const menuContent = (
        <VerticalMenuContent
            navMode="pricefaster"
            collapsed={sideNavCollapse}
            navigationTree={navigationConfig}
            routeKey={currentRouteKey}
            userAuthority={userAuthority as string[]}
            direction={direction}
        />
    )

    return (
        <>
            {larger.lg && (
                <div
                    ref={sideNavRef}
                    style={
                        sideNavCollapse ? sideNavCollapseStyle : sideNavStyle
                    }
                    className={classNames(
                        'side-nav',
                        sideNavColor(),
                        !sideNavCollapse && 'side-nav-expand',
                        sideNavCollapse && 'side-nav-collapsed',
                        // 'relative'
                    )}
                >
                    <ActiveIndicator collapsed={sideNavCollapse} sideNavRef={sideNavRef} currentRouteKey={currentRouteKey} />
                    <div className="side-nav-header">
                        <Logo
                            mode={logoMode()}
                            type="pricefaster"
                            collapsed={sideNavCollapse}
                            className={
                                sideNavCollapse
                                    ? SIDE_NAV_CONTENT_GUTTER
                                    : LOGO_X_GUTTER
                            }
                        />
                    </div>
                    {sideNavCollapse ? (
                        menuContent
                    ) : (
                        <div className="side-nav-content">
                            <ScrollBar autoHide direction={direction}>
                                {menuContent}
                            </ScrollBar>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default SideNav
