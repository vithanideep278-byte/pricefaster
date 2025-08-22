import { useState, Suspense, lazy, useEffect, useRef } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import {
    NAV_MODE_THEMED,
    NAV_MODE_TRANSPARENT,
    DIR_RTL,
} from '@/constants/theme.constant'
import withHeaderItem, { WithHeaderItemProps } from '@/utils/hoc/withHeaderItem'
import NavToggle from '@/components/shared/NavToggle'
import navigationConfig from '@/configs/navigation.config'
import useResponsive from '@/utils/hooks/useResponsive'
import { useAppSelector } from '@/store'
import Logo from '@/components/template/Logo'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent')
)

type MobileNavToggleProps = {
    toggled?: boolean
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

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
    }, [collapsed, sideNavRef, currentRouteKey])

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

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

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

    const { smaller } = useResponsive()
    const sideNavRef = useRef<HTMLDivElement>(null)

    const navColor = () => {
        // Force white background for PriceFaster theme
        return 'bg-white side-nav-light'
    }

    return (
        <>
            {smaller.lg && (
                <>
                    <div className="text-2xl" onClick={openDrawer}>
                        <MobileNavToggle toggled={isOpen} />
                    </div>
                    <Drawer
                        title={<Logo type="pricefaster" mode="light" className='!py-[0px] !px-0' />}
                        isOpen={isOpen}
                        bodyClass={classNames(navColor(), 'p-0')}
                        width={330}
                        placement={direction === DIR_RTL ? 'right' : 'left'}
                        onClose={onDrawerClose}
                        onRequestClose={onDrawerClose}
                    >
                        <Suspense fallback={<></>}>
                            {isOpen && (
                                <div ref={sideNavRef} className="relative">
                                    <ActiveIndicator collapsed={sideNavCollapse} sideNavRef={sideNavRef} currentRouteKey={currentRouteKey} />
                                    <VerticalMenuContent
                                        navMode="pricefaster"
                                        collapsed={sideNavCollapse}
                                        navigationTree={navigationConfig}
                                        routeKey={currentRouteKey}
                                        userAuthority={userAuthority as string[]}
                                        direction={direction}
                                        onMenuItemClick={onDrawerClose}
                                    />
                                </div>
                            )}
                        </Suspense>
                    </Drawer>
                </>
            )}
        </>
    )
}

export default MobileNav
