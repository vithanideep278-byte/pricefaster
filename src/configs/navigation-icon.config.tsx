import {
    HiOutlineHome,
    HiOutlineDesktopComputer,
    HiOutlineColorSwatch,
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <img src="/img/images/homedashboard.png" alt="Home" className="w-[18px] h-[18px] object-contain" />,
    singleMenu: <img src="/img/images/apartment.svg" alt="property" className="w-[18px] h-[18px] object-contain" />,
    singleMenu1: <img src="/img/images/users.png" alt="users" className="w-[18px] h-[18px] object-contain" />,
    // collapseMenu: <HiOutlineTemplate />,
    // collapseMenu: <HiOutlineTemplate />,

    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
    
    // PriceFaster menu icons with specific images
    building: <img src="/img/images/apartment.png" alt="Property" className="w-[18px] h-[18px] object-contain" />,
    users: <img src="/img/images/users.png" alt="User Management" className="w-[18px] h-[18px] object-contain" />,
    mapPin: <img src="/img/images/loactiontrack.png" alt="Property Tracking" className="w-[18px] h-[18px] object-contain" />,
    priceTag: <img src="/img/images/subscription.png" alt="Subscription" className="w-[18px] h-[18px] object-contain" />,
    barChart: <img src="/img/images/growth-chart-invest.png" alt="Financial Metrics" className="w-[18px] h-[18px] object-contain" />,
    userGear: <img src="/img/images/magnet-user.png" alt="Engagement Metrics" className="w-[18px] h-[18px] object-contain" />,
    logout: <img src="/img/images/user-logout.png" alt="Logout" className="w-[18px] h-[18px] object-contain" />,
}

export default navigationIcon
