import React, { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import Dialog from '@/components/ui/Dialog'
import ApiService from '@/services/ApiService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Select from '@/components/ui/Select'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchUsers,
    setPageIndex,
    setPageSize,
    setSearch as setSearchAction,
    setSort as setSortAction,
} from '@/store/slices/userManagement'
import { 
    HiPlus
} from 'react-icons/hi'
import SearchIcon from '@/components/ui/SearchIcon'
import DownloadIcon from '@/components/ui/DownloadIcon'
import { EditPencilSvg, EyeActionSvg, DeleteActionSvg } from '@/assets/svg'
import type { ColumnDef } from '@tanstack/react-table'
import { exportAllPagesToCSV } from '@/utils/exportExcel'

interface UserData {
    id: string
    userName: string
    email: string
    mobileNo: string
    signUpDate: string
    cancelationDate: string
    plan: string
    status: 'Active' | 'Suspended' | 'Inactive'
}

// Shape used only for CSV download – does not affect on-screen table
type UserCsvRow = {
    id: string
    userName: string
    firstName: string
    lastName: string
    email: string
    mobileNo: string
    signUpDate: string
    cancelationDate: string
    plan: string
    status: string
    subscriptionTitle: string
    subscriptionStatus: string
    subscriptionStartDate: string
    subscriptionEndDate: string
    lastLogin: string
    role: string
}

const UserManagement = () => {
    const dispatch = useAppDispatch()

    const { items, loading, total, pageIndex, pageSize, sort, search } = useAppSelector(
        (state) => state.userManagement.list
    )

    const [searchTerm, setSearchTerm] = useState('')

    const [editOpen, setEditOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState<string | undefined>(undefined)
    const [editUserId, setEditUserId] = useState<string>('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [statusBool, setStatusBool] = useState<boolean>(false)

    const [statusOverrides, setStatusOverrides] = useState<Record<string, UserData['status']>>({})

    const displayItems = useMemo(() => {
        return (items || []).map((it) => {
            const planName = (it.plan || '').toString().trim().toLowerCase()
            const isPremiumOrProfessional = planName.includes('premium') || planName.includes('professional')
            const effectiveStatus = isPremiumOrProfessional
                ? 'Active'
                : (statusOverrides[it.id] ?? it.status)
            return {
                ...it,
                status: effectiveStatus,
            }
        })
    }, [items, statusOverrides])

    const openEditForUser = (userId: string, fallbackUser?: UserData) => {
        setEditOpen(true)
        setEditError(undefined)
        setEditUserId(userId)
        setEditLoading(false)

        // Prefill from table data only; no API call on open
        const parts = (fallbackUser?.userName || '').split(' ')
        setFirstName(parts[0] || '')
        setLastName(parts.slice(1).join(' ') || '')
        setEmail(fallbackUser?.email || '')
        setPhone(fallbackUser?.mobileNo || '')
        const lowered = (fallbackUser?.status || '').toLowerCase()
        setStatusBool(lowered === 'active')
    }

    const handleEditSave = async () => {
        setEditLoading(true)
        setEditError(undefined)
        try {
            const idNum = Number(editUserId)
            const payload = {
                user_id: Number.isFinite(idNum) ? idNum : editUserId,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                status: statusBool,
            }
            const res = await ApiService.fetchData<any, typeof payload>({
                url: '/admin/users/edit',
                method: 'post',
                data: payload,
            })

            const message = (res.data?.message || res.data?.msg || 'User updated successfully') as string
            toast.push(
                <Notification type="success" duration={2500} title="Success">
                    {message}
                </Notification>,
                { placement: 'top-end' }
            )

            setEditOpen(false)
            // Refresh list
            dispatch(fetchUsers())
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Failed to update user'
            setEditError(errMsg)
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errMsg}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setEditLoading(false)
        }
    }

    const handleToggleUserStatus = (user: UserData) => {
        const planName = (user.plan || '').trim().toLowerCase()
        const isToggleAllowed = planName === '-' || planName.includes('free')
        if (!isToggleAllowed) {
            toast.push(
                <Notification type="warning" duration={2500} title="Not allowed">
                    Only Free plan or '-' users can be toggled. Premium/Professional remain Active.
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        const currentStatus = statusOverrides[user.id] ?? user.status
        if (currentStatus !== 'Active' && currentStatus !== 'Inactive') {
            toast.push(
                <Notification type="warning" duration={2500} title="Cannot toggle">
                    Only Active/Inactive users can be toggled.
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        const nextStatus: UserData['status'] = currentStatus === 'Active' ? 'Inactive' : 'Active'
        setStatusOverrides((prev) => ({ ...prev, [user.id]: nextStatus }))
        toast.push(
            <Notification type="success" duration={2000} title="Status updated">
                User status set to {nextStatus}.
            </Notification>,
            { placement: 'top-end' }
        )
    }

    // Mock data for users based on the image
    const userData: UserData[] = [
        {
            id: '1',
            userName: 'Christine Brooks',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Free',
            status: 'Active'
        },
        {
            id: '2',
            userName: 'Rosie Pearson',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Premium',
            status: 'Suspended'
        },
        {
            id: '3',
            userName: 'Darrell Caldwell',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Pro',
            status: 'Inactive'
        },
        {
            id: '4',
            userName: 'Gilbert Johnston',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Free',
            status: 'Active'
        },
        {
            id: '5',
            userName: 'Alan Cain',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Premium',
            status: 'Active'
        },
        {
            id: '6',
            userName: 'Alfred Murray',
            email: 'mail@somemail.com',
            mobileNo: '+1 854 652 4102',
            signUpDate: '11-12-2024',
            cancelationDate: '11-12-2024',
            plan: 'Pro',
            status: 'Suspended'
        }
    ]

    useEffect(() => {
        dispatch(fetchUsers())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize, sort, search])

    // Table columns definition
    const columns: ColumnDef<UserData>[] = [
        {
            header: "User's Name",
            accessorKey: 'userName',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        <span className="">{row.userName}</span>
                    </div>
                )
            }
        },
        {
            header: 'Email Id',
            accessorKey: 'email',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.email}</span>
            }
        },
        {
            header: 'Mobile No.',
            accessorKey: 'mobileNo',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.mobileNo}</span>
            }
        },
        {
            header: 'Sign Up Date',
            accessorKey: 'signUpDate',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.signUpDate}</span>
            }
        },
        {
            header: 'Cancelation Date',
            accessorKey: 'cancelationDate',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.cancelationDate}</span>
            }
        },
        {
            header: 'Plan',
            accessorKey: 'plan',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.plan}</span>
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            enableSorting: true,
            meta: { headerAlign: 'center' },
            cell: (props) => {
                const row = props.row.original
                const getStatusColor = (status: string) => {
                    switch (status) {
                        case 'Active':
                            return 'rounded-[13.5px] bg-[#00C417] text-white text-[14px] font-bold leading-none font-nunito px-[26px] py-[8px] flex justify-center'
                        case 'Suspended':
                            return 'rounded-[13.5px] bg-[#FF7308] text-white text-[14px] font-bold leading-none font-nunito px-[26px] py-[8px] flex justify-center'
                        case 'Inactive':
                            return 'rounded-[13.5px] bg-[#E8E8E8] text-gray-800 text-[14px] font-bold leading-none font-nunito px-[26px] py-[8px] flex justify-center'
                        default:
                            return 'rounded-[13.5px] bg-[#E8E8E8] text-gray-800 text-[14px] font-bold leading-none font-nunito'
                    }
                }
                return (
                    <Badge className={getStatusColor(row.status)}>
                        {row.status}
                    </Badge>
                )
            }
        },
        {
            header: 'Action',
            accessorKey: 'actions',
            meta: { headerAlign: 'center' },
            cell: (props) => {
                const row = props.row.original as UserData
                return (
                    <div className="flex items-center justify-center">
                        <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                            <button
                                className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200"
                                onClick={() => openEditForUser(row.id, row)}
                            >
                                <EditPencilSvg />
                            </button>
                            {/* <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
                                <EyeActionSvg />
                            </button> */}
                            <button className="p-[9px_8px_9px_12px] hover:bg-white transition-colors duration-200" onClick={() => handleToggleUserStatus(row)}>
                                <DeleteActionSvg />
                            </button>
                        </div>
                    </div>
                )
            }
        }
    ]

    const handlePaginationChange = (page: number) => {
        dispatch(setPageIndex(page))
    }

    const handlePageSizeChange = (size: number) => {
        dispatch(setPageSize(size))
    }

    const handleSort = (sort: { order: 'asc' | 'desc' | ''; key: string | number }) => {
        dispatch(setSortAction(sort))
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(setSearchAction(searchTerm))
            dispatch(setPageIndex(1))
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm])

    return (
        <div className="min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">User Management</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
                    {/* Search Input */}
                    <div className="relative bg-white rounded-[35px] w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search Users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full sm:w-[253px] text-[#202224] font-normal text-[14px] leading-none font-nunito rounded-[19px] border border-[#D5D5D5] bg-white"
                        />
                    </div>
                    {/* Button Row: Add User + Download always together */}
                    <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                        {/* <Button variant="solid" size="sm" className="flex items-center justify-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] w-full sm:w-auto">
                            Add User
                        </Button> */}
                        <Button variant="solid" size="sm" className="flex items-center justify-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] w-full sm:w-auto" onClick={async () => {
                            await exportAllPagesToCSV<any, UserCsvRow>({
                                endpoint: '/admin/users/list',
                                filename: 'users.csv',
                                basePayload: {
                                    search: search || '',
                                    sort: sort?.key || 'created_at',
                                    sort_order: (sort?.order?.toUpperCase?.() as 'ASC' | 'DESC') || 'DESC',
                                },
                                limitPerPage: 200,
                                normalize: (u, idx) => {
                                    const row = (u || {}) as any
                                    const id = String(row?.id ?? row?._id ?? idx)
                                    const fullName = [row?.first_name, row?.last_name].filter(Boolean).join(' ').trim()
                                    const userName = fullName || row?.userName || row?.name || '-'
                                    const firstName = row?.first_name || (userName ? String(userName).split(' ')[0] : '-') || '-'
                                    const lastName = row?.last_name || (userName ? String(userName).split(' ').slice(1).join(' ') : '-') || '-'
                                    const email = row?.email || row?.emailAddress || '-'
                                    const mobileNo = row?.phone || row?.mobile || row?.mobileNo || '-'
                                    const signUpDate = row?.created_at ? new Date(row.created_at).toLocaleDateString() : (row?.signUpDate || '-')
                                    const cancelationDate = row?.cancelationDate || (row?.deleted_at ? new Date(row.deleted_at).toLocaleDateString() : '-')
                                    const plan = row?.user_subscriptions?.subscription?.title || row?.plan || '-'
                                    let status: UserData['status'] = 'Inactive'
                                    if (typeof row?.status === 'boolean') {
                                        status = row.status ? 'Active' : 'Inactive'
                                    } else if (typeof row?.status === 'string') {
                                        const s = row.status.toLowerCase()
                                        status = s === 'active' ? 'Active' : s === 'suspended' ? 'Suspended' : 'Inactive'
                                    }
                                    const subscriptionTitle = row?.user_subscriptions?.subscription?.title || row?.subscription?.title || '-'
                                    const subscriptionStatus = row?.user_subscriptions?.status || row?.subscription?.status || '-'
                                    const subscriptionStartDate = row?.user_subscriptions?.start_date || row?.subscription?.start_date || '-'
                                    const subscriptionEndDate = row?.user_subscriptions?.end_date || row?.subscription?.end_date || '-'
                                    const lastLogin = row?.last_login || row?.lastLogin || '-'
                                    const role = row?.role || row?.user_role || '-'
                                    return { id, userName, firstName, lastName, email, mobileNo, signUpDate, cancelationDate, plan, status, subscriptionTitle, subscriptionStatus, subscriptionStartDate, subscriptionEndDate, lastLogin, role }
                                },
                                columns: [
                                    { header: 'User ID', key: 'id' },
                                    { header: "User's Name", key: 'userName' },
                                    { header: 'First Name', key: 'firstName' },
                                    { header: 'Last Name', key: 'lastName' },
                                    { header: 'Email', key: 'email' },
                                    { header: 'Mobile No.', key: 'mobileNo' },
                                    { header: 'Sign Up Date', key: 'signUpDate' },
                                    { header: 'Cancelation Date', key: 'cancelationDate' },
                                    { header: 'Plan', key: 'plan' },
                                    { header: 'Status', key: 'status' },
                                    { header: 'Subscription Title', key: 'subscriptionTitle' },
                                    { header: 'Subscription Status', key: 'subscriptionStatus' },
                                    { header: 'Subscription Start', key: 'subscriptionStartDate' },
                                    { header: 'Subscription End', key: 'subscriptionEndDate' },
                                    { header: 'Last Login', key: 'lastLogin' },
                                    { header: 'Role', key: 'role' },
                                ],
                            })
                        }}>
                            Download
                            <DownloadIcon className="ml-2" size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-6 mb-6">
                {/* Total Users Card */}
                <Card className="bg-white rounded-[14px] shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-3">
                    <div className="relative">
                        <div className='flex justify-between items-start '>
                            <div className="">
                                <h3 className="text-[#202224] font-nunito text-[18px] font-bold leading-normal tracking-[-0.114px] opacity-70 mb-[16px]">Total Users</h3>
                                <span className="text-[#202224] font-nunito text-[28px] not-italic font-bold leading-none tracking-[1px]">40,689</span>
                            </div>
                            <div className=" rounded-lg flex items-center justify-center">
                                <img src="/img/images/totaluser.png" alt="Total Users" className="" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Active Users Card */}
                <Card className="bg-white rounded-[14px] shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-3">
                    <div className="relative">
                        <div className='flex justify-between items-start '>
                            <div className="">
                                <h3 className="text-[#202224] font-nunito text-[18px] font-bold leading-normal tracking-[-0.114px] opacity-70 mb-[16px]">Active Users</h3>
                                <span className="text-[#202224] font-nunito text-[28px] not-italic font-bold leading-none tracking-[1px]">10,293</span>
                            </div>
                            <div className=" rounded-lg flex items-center justify-center">
                                <img src="/img/images/activeuser.png" alt="Active Users" className="" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* User Growth Card */}
                <Card className="bg-white rounded-[14px] shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-3">
                    <div className=" relative">
                        <div className='flex justify-between items-start '>
                            <div className="">
                                <h3 className="text-[#202224] font-nunito text-[18px] font-bold leading-normal tracking-[-0.114px] opacity-70 mb-[16px]">User Growth</h3>
                                <span className="text-[#202224] font-nunito text-[28px] not-italic font-bold leading-none tracking-[1px]">60%</span>
                            </div>
                            <div className=" rounded-lg flex items-center justify-center">
                                <img src="/img/images/growthuser.png" alt="User Growth" className="" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Churn Rate Card */}
                <Card className="bg-white rounded-[14px] shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-3">
                    <div className=" relative">
                        <div className='flex justify-between items-start '>
                            <div className="">
                                <h3 className="text-[#202224] font-nunito text-[18px] font-bold leading-normal tracking-[-0.114px] opacity-70 mb-[16px]">Churn Rate</h3>
                                <span className="text-[#202224] font-nunito text-[28px] not-italic font-bold leading-none tracking-[1px]">67%</span>
                            </div>
                            <div className=" rounded-lg flex items-center justify-center">
                                <img src="/img/images/monthlyuser.png" alt="Churn Rate" className="" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* DataTable */}
            <div className="">
                <DataTable
                    columns={columns}
                    data={displayItems}
                    loading={loading}
                    onPaginationChange={handlePaginationChange}
                    onSelectChange={handlePageSizeChange}
                    onSort={handleSort}
                    pageSizes={[10, 25, 50]}
                    pagingData={{
                        total: total,
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                    }}
                />
                </div>

            {/* Edit User Modal */}
            <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} width={640}>
                <div className="p-6">
                    <h3 className="text-[#202224] font-nunito text-[20px] font-bold leading-none mb-4">Edit User</h3>
                    {editError && (
                        <div className="text-red-500 text-sm mb-3">{editError}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">First Name</label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Last Name</label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Email</label>
                            <Input value={email} readOnly className="bg-gray-100" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Phone</label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Active</label>
                            <Select
                                isSearchable={false}
                                value={{ value: statusBool, label: statusBool ? 'True' : 'False' }}
                                options={[
                                    { value: true, label: 'True' },
                                    { value: false, label: 'False' },
                                ]}
                                onChange={(opt) => setStatusBool(Boolean(opt?.value))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="default" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="solid" className="!bg-[#4880FF]" disabled={editLoading} onClick={handleEditSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default UserManagement 