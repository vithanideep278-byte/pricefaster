import Header from '@/components/template/Header'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
import MobileNav from '@/components/template/MobileNav'
import StackedSideNav from '@/components/template/StackedSideNav'
import HeaderSearch from '@/components/template/HeaderSearch'
import View from '@/views'
import { SPLITTED_SIDE_NAV_MINI_WIDTH } from '@/constants/theme.constant'

const HeaderActionsStart = () => {
    return (
        <>
            <MobileNav />
            <HeaderSearch />
        </>
    )
}

const HeaderActionsEnd = () => {
    return (
        <>
            <SidePanel />
            <UserDropdown hoverable={false} />
        </>
    )
}

const StackedSideLayout = () => {
    const mainContentStyle = {
        marginLeft: SPLITTED_SIDE_NAV_MINI_WIDTH,
    }

    return (
        <div className="app-layout-stacked-side flex flex-auto flex-col">
            <div className="flex flex-auto min-w-0">
                <StackedSideNav />
                <div 
                    className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full"
                    style={mainContentStyle}
                >
                    <Header
                        className="shadow dark:shadow-2xl"
                        headerStart={<HeaderActionsStart />}
                        headerEnd={<HeaderActionsEnd />}
                    />
                    <div className="h-full flex flex-auto flex-col">
                        <View />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StackedSideLayout
