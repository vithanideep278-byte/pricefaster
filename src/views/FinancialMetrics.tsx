import React, { useCallback, useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import { 
    HiArrowDown
} from 'react-icons/hi'
import SearchIcon from '@/components/ui/SearchIcon'
import type { ColumnDef } from '@tanstack/react-table'
import DownloadIcon from '@/components/ui/DownloadIcon'
import ApiService from '@/services/ApiService'
import { exportAllPagesToCSV } from '@/utils/exportExcel'

interface FinancialMetricsData {
    id: string
    metricName: string
    month: string
    plan: string
    location: string
    currentValue: string
    lastMonth: string
    metricsChange: string
}

// CSV-only row shape for export (does not affect on-screen table)
type FinancialMetricsCsvRow = {
    id: string
    metricName: string
    metricCode: string
    month: string
    periodStart: string
    periodEnd: string
    plan: string
    planId: string
    location: string
    city: string
    state: string
    country: string
    currentValue: string
    lastMonth: string
    changeAbsolute: string
    changePercent: string
    metricsChange: string
    currency: string
    source: string
    createdAt: string
    updatedAt: string
}

const FinancialMetrics = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [items, setItems] = useState<FinancialMetricsData[]>([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState<{ key: string | number; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })

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

    const normalizeFinancialMetric = (item: any, index: number): FinancialMetricsData => {
        const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
        const metricName = item?.metricName || item?.metric_name || item?.metric || item?.name || '-'
        const month = item?.month || formatMonthYear(item?.date || item?.created_at || item?.period_start || item?.period)
        const plan = item?.plan || item?.plan_name || item?.tier || '-'
        const location = item?.location || item?.city_state || [item?.city, item?.state].filter(Boolean).join(', ') || '-'
        const currentRaw = item?.currentValue || item?.current_value || item?.current || item?.value
        const lastRaw = item?.lastMonth || item?.last_month || item?.previous_value || item?.previous
        const currentValue = typeof currentRaw === 'number' ? currentRaw.toString() : (currentRaw ?? '-')
        const lastMonth = typeof lastRaw === 'number' ? lastRaw.toString() : (lastRaw ?? '-')
        const changeRaw = item?.metricsChange || item?.change || item?.change_percent || item?.changePercentage
        const metricsChange = typeof changeRaw === 'number' ? `${changeRaw}%` : (changeRaw ?? '-')

        return { id, metricName, month, plan, location, currentValue, lastMonth, metricsChange }
    }

    const fetchFinancialMetrics = useCallback(async () => {
        setLoading(true)
        try {
            const offsetForBackend = pageIndex <= 1 ? 0 : pageIndex
            const payload: Record<string, unknown> = {
                limit: pageSize,
                offset: offsetForBackend,
                search: searchTerm ?? "",
                sort: sort.key || undefined,
                sort_order: sort.order ? sort.order.toUpperCase() : undefined,
            }

            const res = await ApiService.fetchData<any, typeof payload>({
                url: '/admin/metrics/financial',
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

            const normalized = rows.map((r, idx) => normalizeFinancialMetric(r, idx))
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
            fetchFinancialMetrics()
        }, 300)
        return () => clearTimeout(t)
    }, [fetchFinancialMetrics])

    // Table columns definition
    const columns: ColumnDef<FinancialMetricsData>[] = [
        {
            header: 'Metric Name',
            accessorKey: 'metricName',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        <span className="">{row.metricName}</span>
                    </div>
                )
            }
        },
        {
            header: 'Month',
            accessorKey: 'month',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.month}</span>
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
            header: 'Location',
            accessorKey: 'location',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.location}</span>
            }
        },
        {
            header: 'Current Value',
            accessorKey: 'currentValue',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.currentValue}</span>
            }
        },
        {
            header: 'Last Month',
            accessorKey: 'lastMonth',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.lastMonth}</span>
            }
        },
        {
            header: 'Metrics Change',
            accessorKey: 'metricsChange',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.metricsChange}</span>
            }
        }
    ]

    return (
        <div className="min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">Financial Metrics</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
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
                    <div className='flex flex-row gap-2 w-full sm:w-auto justify-end'>
                    <Button variant="solid" size="sm" className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] " onClick={async () => {
                        await exportAllPagesToCSV<any, FinancialMetricsCsvRow>({
                            endpoint: '/admin/metrics/financial',
                            filename: 'financial-metrics.csv',
                            basePayload: {
                                search: searchTerm ?? '',
                                sort: sort.key || undefined,
                                sort_order: sort.order ? sort.order.toUpperCase() : undefined,
                            },
                            limitPerPage: 200,
                            normalize: (item, index) => {
                                const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
                                const metricName = item?.metricName || item?.metric_name || item?.metric || item?.name || '-'
                                const metricCode = item?.metric_code || item?.code || '-'
                                const month = item?.month || formatMonthYear(item?.date || item?.created_at || item?.period_start || item?.period)
                                const periodStart = formatDate(item?.period_start || item?.start_date)
                                const periodEnd = formatDate(item?.period_end || item?.end_date)
                                const plan = item?.plan || item?.plan_name || item?.tier || '-'
                                const planId = item?.plan_id?.toString?.() || '-'
                                const location = item?.location || item?.city_state || [item?.city, item?.state].filter(Boolean).join(', ') || '-'
                                const city = item?.city || '-'
                                const state = item?.state || '-'
                                const country = item?.country || '-'
                                const currentRaw = item?.currentValue || item?.current_value || item?.current || item?.value
                                const lastRaw = item?.lastMonth || item?.last_month || item?.previous_value || item?.previous
                                const currentValue = typeof currentRaw === 'number' ? currentRaw.toString() : (currentRaw ?? '-')
                                const lastMonth = typeof lastRaw === 'number' ? lastRaw.toString() : (lastRaw ?? '-')
                                const changeAbsNum = (typeof currentRaw === 'number' && typeof lastRaw === 'number') ? (currentRaw - lastRaw) : null
                                const changeAbsolute = changeAbsNum == null ? '-' : changeAbsNum.toString()
                                const changePercentNum = (typeof currentRaw === 'number' && typeof lastRaw === 'number' && lastRaw !== 0)
                                    ? ((currentRaw - lastRaw) / lastRaw) * 100
                                    : null
                                const changePercent = changePercentNum == null ? '-' : `${changePercentNum.toFixed(2)}%`
                                const changeRaw = item?.metricsChange || item?.change || item?.change_percent || item?.changePercentage
                                const metricsChange = typeof changeRaw === 'number' ? `${changeRaw}%` : (changeRaw ?? '-')
                                const currency = item?.currency || '-'
                                const source = item?.source || item?.origin || '-'
                                const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : '-'
                                const updatedAt = item?.updated_at ? new Date(item.updated_at).toLocaleString() : '-'
                                return { id, metricName, metricCode, month, periodStart, periodEnd, plan, planId, location, city, state, country, currentValue, lastMonth, changeAbsolute, changePercent, metricsChange, currency, source, createdAt, updatedAt }
                            },
                            columns: [
                                { header: 'Metric ID', key: 'id' },
                                { header: 'Metric Name', key: 'metricName' },
                                { header: 'Metric Code', key: 'metricCode' },
                                { header: 'Month', key: 'month' },
                                { header: 'Period Start', key: 'periodStart' },
                                { header: 'Period End', key: 'periodEnd' },
                                { header: 'Plan', key: 'plan' },
                                { header: 'Plan ID', key: 'planId' },
                                { header: 'Location', key: 'location' },
                                { header: 'City', key: 'city' },
                                { header: 'State', key: 'state' },
                                { header: 'Country', key: 'country' },
                                { header: 'Current Value', key: 'currentValue' },
                                { header: 'Last Month', key: 'lastMonth' },
                                { header: 'Change (Abs)', key: 'changeAbsolute' },
                                { header: 'Change (%)', key: 'changePercent' },
                                { header: 'Metrics Change', key: 'metricsChange' },
                                { header: 'Currency', key: 'currency' },
                                { header: 'Source', key: 'source' },
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
                    data={items}
                    loading={loading}
                    onPaginationChange={(page) => setPageIndex(page)}
                    onSelectChange={(size) => { setPageSize(size); setPageIndex(1) }}
                    onSort={(s) => setSort(s)}
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

export default FinancialMetrics 