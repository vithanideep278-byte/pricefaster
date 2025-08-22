import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { useAppSelector } from '@/store'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
    {
        label: 'Profile',
        path: '/user-profile',
        icon: <HiOutlineCog />
    }
]

const _UserDropdown = ({ className }: CommonProps) => {

    const { signOut } = useAuth()
    const { email = '', userName = '' } = useAppSelector((state) => state.auth.user)

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center')}>
            <Avatar 
                size={40} 
                shape="circle" 
                src="/img/images/headerprofile.svg"
                className="bg-gray-200 dark:bg-gray-600"
            />
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <Avatar 
                            shape="circle" 
                            src="/img/images/headerprofile.svg"
                            className="bg-gray-200 dark:bg-gray-600"
                        />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {userName || 'User'}
                            </div>
                            <div className="text-xs">{email || ''}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="mb-1 px-0"
                    >
                        <Link 
                            className="flex h-full w-full px-2" 
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                {/* <Dropdown.Item variant="divider" /> */}
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
