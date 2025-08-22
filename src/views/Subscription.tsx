import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import SearchIcon from '@/components/ui/SearchIcon'
import { EditPencilSvg, EyeActionSvg, DeleteActionSvg } from '@/assets/svg'
import type { ColumnDef } from '@tanstack/react-table'
import DownloadIcon from '@/components/ui/DownloadIcon'
import ApiService from '@/services/ApiService'
import { exportAllPagesToCSV } from '@/utils/exportExcel'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface SubscriptionData {
    id: string
    userName: string
    emailAddress: string
    plan: string
    paymentDate: string
    startDate: string
    successfulPaymentMonth: string
    status: 'Active' | 'Suspended' | 'Inactive'
}

// CSV-only row shape for export (does not affect on-screen table)
type SubscriptionCsvRow = {
    id: string
    subscriptionId: string
    userId: string
    userName: string
    firstName: string
    lastName: string
    emailAddress: string
    plan: string
    planId: string
    amount: string
    currency: string
    paymentDate: string
    startDate: string
    renewalDate: string
    nextBillingDate: string
    successfulPaymentMonth: string
    status: string
    statusReason: string
    paymentMethod: string
    transactionId: string
    couponCode: string
    trialStartDate: string
    trialEndDate: string
    autoRenew: string
    country: string
    city: string
    createdAt: string
    updatedAt: string
}

const Subscription = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [items, setItems] = useState<SubscriptionData[]>([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState<{ key: string | number; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })
    const [statusOverrides, setStatusOverrides] = useState<Record<string, SubscriptionData['status']>>({})

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

    const formatDate = (value?: string) => {
        if (!value) return '-'
        const d = new Date(value)
        if (isNaN(d.getTime())) return '-'
        return d.toLocaleDateString()
    }

    const formatMonthYear = (value?: string) => {
        if (!value) return '-'
        const d = new Date(value)
        if (isNaN(d.getTime())) return '-'
        return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    }

    const normalizeSubscription = (item: any, index: number): SubscriptionData => {
        const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
        const user = item?.user || {}
        const subscription = item?.subscription || {}
        const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
        const userName = fullName || user?.name || user?.userName || '-'
        const emailAddress = user?.email || item?.email || '-'
        const plan = subscription?.title || item?.plan || item?.plan_name || '-'
        const startDate = formatDate(item?.start_date)
        const paymentDate = formatDate(item?.created_at || item?.start_date)
        const successfulPaymentMonth = formatMonthYear(item?.start_date || item?.created_at)
        const statusRaw = `${item?.status || ''}`.toLowerCase()
        const status: SubscriptionData['status'] =
            statusRaw === 'active'
                ? 'Active'
                : statusRaw === 'suspended'
                ? 'Suspended'
                : 'Inactive'

        return {
            id,
            userName,
            emailAddress,
            plan,
            paymentDate,
            startDate,
            successfulPaymentMonth,
            status,
        }
    }

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true)
        try {
            const offsetForBackend = pageIndex <= 1 ? 0 : pageIndex
            const payload: Record<string, unknown> = {
                limit: pageSize,
                offset: offsetForBackend,
                search: searchTerm ?? "",
                sort: sort.key || undefined,
                // Backend commonly expects 'ASC' | 'DESC'
                sort_order: sort.order ? sort.order.toUpperCase() : undefined,
            }

            const res = await ApiService.fetchData<any, typeof payload>({
                url: '/admin/users/subscriptions/list',
                method: 'post',
                data: payload,
            })

            const body = res.data as any
            let rows: any[] = []
            let totalCount = 0

            if (Array.isArray(body)) {
                rows = body
                totalCount = body.length
            } else if (body?.data) {
                const dataBlock = body.data as any
                rows = dataBlock.data || dataBlock.rows || dataBlock.list || dataBlock.items || []
                totalCount = dataBlock.total ?? body.total ?? rows.length
            } else {
                rows = body?.rows || body?.list || body?.items || []
                totalCount = body?.total ?? rows.length
            }

            const normalized = rows.map((r, idx) => normalizeSubscription(r, idx))
            setItems(normalized)
            setTotal(typeof totalCount === 'number' ? totalCount : normalized.length)
        } catch (e) {
            setItems([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, searchTerm, sort])

    useEffect(() => {
        const t = setTimeout(() => {
            fetchSubscriptions()
        }, 300)
        return () => clearTimeout(t)
    }, [fetchSubscriptions])

    const handleToggleSubscriptionStatus = (sub: SubscriptionData) => {
        const planName = (sub.plan || '').trim().toLowerCase()
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

        const currentStatus = statusOverrides[sub.id] ?? sub.status
        if (currentStatus !== 'Active' && currentStatus !== 'Inactive') {
            toast.push(
                <Notification type="warning" duration={2500} title="Cannot toggle">
                    Only Active/Inactive users can be toggled.
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        const nextStatus: SubscriptionData['status'] = currentStatus === 'Active' ? 'Inactive' : 'Active'
        setStatusOverrides((prev) => ({ ...prev, [sub.id]: nextStatus }))
        toast.push(
            <Notification type="success" duration={2000} title="Status updated">
                Subscription status set to {nextStatus}.
            </Notification>,
            { placement: 'top-end' }
        )
    }

    const columns: ColumnDef<SubscriptionData>[] = [
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
            header: 'Email Address',
            accessorKey: 'emailAddress',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.emailAddress}</span>
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
            header: 'Payment Date',
            accessorKey: 'paymentDate',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.paymentDate}</span>
            }
        },
        {
            header: 'Start Date',
            accessorKey: 'startDate',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.startDate}</span>
            }
        },
        {
            header: 'Successful Payment Month',
            accessorKey: 'successfulPaymentMonth',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.successfulPaymentMonth}</span>
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
                const row = props.row.original as SubscriptionData
                return (
                    <div className="flex items-center justify-center">
                        <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                            {/* <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
                                <EditPencilSvg />
                            </button>
                            <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
                                <EyeActionSvg />
                            </button> */}
                            <button className="p-[9px_8px_9px_12px] hover:bg-white transition-colors duration-200" onClick={() => handleToggleSubscriptionStatus(row)}>
                                <DeleteActionSvg />
                            </button>
                        </div>
                    </div>
                )
            }
        }
    ]

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setPageIndex(1)
    }

    const handleSort = (s: { order: 'asc' | 'desc' | ''; key: string | number }) => {
        setSort(s)
    }

    return (
        <div className="min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">Subscriptions</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
                <div className="relative bg-white rounded-[35px] w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search Users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10  w-full sm:w-[253px] text-[#202224] font-normal text-[14px] leading-none font-nunito rounded-[19px] border border-[#D5D5D5] bg-white"
                        />
                    </div>
                    <div className='flex flex-row gap-2 w-full sm:w-auto justify-end'>

                    <Button variant="solid" size="sm" className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF]" onClick={async () => {
                        await exportAllPagesToCSV<any, SubscriptionCsvRow>({
                            endpoint: '/admin/users/subscriptions/list',
                            filename: 'subscriptions.csv',
                            basePayload: {
                                search: searchTerm ?? '',
                                sort: sort.key || undefined,
                                sort_order: sort.order ? sort.order.toUpperCase() : undefined,
                            },
                            limitPerPage: 200,
                            normalize: (item, index) => {
                                const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
                                const subscriptionId = id
                                const user = item?.user || {}
                                const subscription = item?.subscription || {}
                                const userId = user?.id?.toString?.() || user?._id?.toString?.() || '-'
                                const firstName = user?.first_name || '-'
                                const lastName = user?.last_name || '-'
                                const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
                                const userName = fullName || user?.name || user?.userName || '-'
                                const emailAddress = user?.email || item?.email || '-'
                                const plan = subscription?.title || item?.plan || item?.plan_name || '-'
                                const planId = subscription?.id?.toString?.() || item?.plan_id?.toString?.() || '-'
                                const amountVal = item?.amount ?? item?.price
                                const amount = amountVal == null ? '-' : `${amountVal}`
                                const currency = item?.currency || '-'
                                const startDate = formatDate(item?.start_date)
                                const paymentDate = formatDate(item?.created_at || item?.start_date)
                                const renewalDate = formatDate(item?.renewal_date || item?.end_date)
                                const nextBillingDate = formatDate(item?.next_billing_date)
                                const successfulPaymentMonth = formatMonthYear(item?.start_date || item?.created_at)
                                const statusRaw = `${item?.status || ''}`.toLowerCase()
                                const status = statusRaw === 'active' ? 'Active' : statusRaw === 'suspended' ? 'Suspended' : 'Inactive'
                                const statusReason = item?.status_reason || '-'
                                const paymentMethod = item?.payment_method || '-'
                                const transactionId = item?.transaction_id || '-'
                                const couponCode = item?.coupon_code || '-'
                                const trialStartDate = formatDate(item?.trial_start_date)
                                const trialEndDate = formatDate(item?.trial_end_date)
                                const autoRenew = typeof item?.auto_renew === 'boolean' ? (item.auto_renew ? 'True' : 'False') : '-'
                                const country = user?.country || '-'
                                const city = user?.city || '-'
                                const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : '-'
                                const updatedAt = item?.updated_at ? new Date(item.updated_at).toLocaleString() : '-'
                                return { id, subscriptionId, userId, userName, firstName, lastName, emailAddress, plan, planId, amount, currency, paymentDate, startDate, renewalDate, nextBillingDate, successfulPaymentMonth, status, statusReason, paymentMethod, transactionId, couponCode, trialStartDate, trialEndDate, autoRenew, country, city, createdAt, updatedAt }
                            },
                            columns: [
                                { header: 'Subscription ID', key: 'subscriptionId' },
                                { header: 'User ID', key: 'userId' },
                                { header: "User's Name", key: 'userName' },
                                { header: 'First Name', key: 'firstName' },
                                { header: 'Last Name', key: 'lastName' },
                                { header: 'Email Address', key: 'emailAddress' },
                                { header: 'Plan', key: 'plan' },
                                { header: 'Plan ID', key: 'planId' },
                                { header: 'Amount', key: 'amount' },
                                { header: 'Currency', key: 'currency' },
                                { header: 'Payment Date', key: 'paymentDate' },
                                { header: 'Start Date', key: 'startDate' },
                                { header: 'Renewal Date', key: 'renewalDate' },
                                { header: 'Next Billing Date', key: 'nextBillingDate' },
                                { header: 'Successful Payment Month', key: 'successfulPaymentMonth' },
                                { header: 'Status', key: 'status' },
                                { header: 'Status Reason', key: 'statusReason' },
                                { header: 'Payment Method', key: 'paymentMethod' },
                                { header: 'Transaction ID', key: 'transactionId' },
                                { header: 'Coupon Code', key: 'couponCode' },
                                { header: 'Trial Start', key: 'trialStartDate' },
                                { header: 'Trial End', key: 'trialEndDate' },
                                { header: 'Auto Renew', key: 'autoRenew' },
                                { header: 'Country', key: 'country' },
                                { header: 'City', key: 'city' },
                                { header: 'Created At', key: 'createdAt' },
                                { header: 'Updated At', key: 'updatedAt' },
                            ],
                        })
                    }}>
                        Download
                        <DownloadIcon className="ml-2" size={16} />
                    </Button>
                    </div>
                </div>
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
        </div>
    )
}

export default Subscription 