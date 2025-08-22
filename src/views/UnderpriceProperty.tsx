import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import {
    HiArrowDown
} from 'react-icons/hi'
import SearchIcon from '@/components/ui/SearchIcon'
import { EditPencilSvg, DeleteActionSvg } from '@/assets/svg'
import type { ColumnDef } from '@tanstack/react-table'
import DownloadIcon from '@/components/ui/DownloadIcon'
import ApiService from '@/services/ApiService'
import { exportAllPagesToCSV } from '@/utils/exportExcel'

interface UnderpricePropertyData {
    id: string
    address: string
    bed: string
    bath: string
    city: string
    state: string
    price: string
    chatgptPriceAnalysis: string
}

const UnderpriceProperty = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [items, setItems] = useState<UnderpricePropertyData[]>([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState<{ key: string | number; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })

    const normalizeUnderprice = (item: any, index: number): UnderpricePropertyData => {
        const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
        const address = item?.address || item?.full_address || [item?.street, item?.city, item?.state].filter(Boolean).join(', ') || '-'
        const bed = (item?.bed ?? item?.beds ?? item?.bedrooms ?? '-') + ''
        const bath = (item?.bath ?? item?.baths ?? item?.bathrooms ?? '-') + ''
        const city = item?.city || item?.location?.city || '-'
        const state = item?.state || item?.location?.state || '-'
        const rawPrice = item?.price || item?.price_text || item?.amount
        const price = typeof rawPrice === 'number' ? `$${rawPrice.toLocaleString()}` : (rawPrice || '-')
        const chatgptPriceAnalysis = item?.chatgptPriceAnalysis || item?.analysis || item?.gpt_analysis || '-'
        return { id, address, bed, bath, city, state, price, chatgptPriceAnalysis }
    }

    const fetchUnderpricedProperties = useCallback(async () => {
        setLoading(true)
        try {
            // Derive offset as per requirement:
            // page 1 => offset 0, page 2 => offset 2, page 3 => offset 3, page 4 => offset 4, ...
            const offsetForBackend = pageIndex <= 1 ? 0 : pageIndex

            const payload: Record<string, unknown> = {
                limit: pageSize,
                offset: offsetForBackend,
                page: pageIndex,
                search: searchTerm ?? "",
                is_displayed: true,
                sort: sort.key || undefined,
                sort_order: sort.order ? sort.order.toUpperCase() : undefined,
            }

            const res = await ApiService.fetchData<any, typeof payload>({
                url: '/admin/properties/under-priced/list',
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
                rows = dataBlock.rows || dataBlock.list || dataBlock.items || dataBlock.data || []
                totalCount = dataBlock.total ?? body.total ?? rows.length
            } else {
                rows = body?.rows || body?.list || body?.items || []
                totalCount = body?.total ?? rows.length
            }

            const normalized = rows.map((r, idx) => normalizeUnderprice(r, idx))
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
            fetchUnderpricedProperties()
        }, 300)
        return () => clearTimeout(t)
    }, [fetchUnderpricedProperties])

    // Table columns definition
    const columns: ColumnDef<UnderpricePropertyData>[] = [
        {
            header: 'Address',
            accessorKey: 'address',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        <span className="">{row.address}</span>
                    </div>
                )
            }
        },
        {
            header: 'Bed',
            accessorKey: 'bed',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.bed}</span>
            }
        },
        {
            header: 'Bath',
            accessorKey: 'bath',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.bath}</span>
            }
        },
        {
            header: 'City',
            accessorKey: 'city',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.city}</span>
            }
        },
        {
            header: 'State',
            accessorKey: 'state',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.state}</span>
            }
        },
        {
            header: 'Price',
            accessorKey: 'price',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.price}</span>
            }
        },
        {
            header: 'ChatGPT Price Analysis',
            accessorKey: 'chatgptPriceAnalysis',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="max-w-xs">
                        <span className="text-sm text-gray-600 line-clamp-2">
                            {row.chatgptPriceAnalysis}
                        </span>
                    </div>
                )
            }
        },
        // {
        //     header: 'Action',
        //     accessorKey: 'actions',
        //     meta: { headerAlign: 'center' },
        //     cell: (props) => {
        //         const row = props.row.original
        //         return (
        //             <div className="flex items-center justify-center">
        //                 <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
        //                     <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
        //                         <EditPencilSvg />
        //                     </button>
        //                     <button className="p-[9px_8px_9px_12px] hover:bg-white transition-colors duration-200">
        //                         <DeleteActionSvg />
        //                     </button>
        //                 </div>
        //             </div>
        //         )
        //     }
        // }
    ]

    return (
        <div className="min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">Underprice Property</h1>

                {/* Search and Actions Container */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
                    {/* Search + Upload File */}

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


                    {/* Manage + Download always on same line */}
                    <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                        <Button
                            variant="solid"
                            size="sm"
                            className="flex items-center justify-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] w-full sm:w-auto"
                            onClick={() => navigate('/underprice-property/manage')}
                        >
                            Manage
                        </Button>
                        {/* <Button
                            variant="solid"
                            size="sm"
                            className="flex items-center justify-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] w-full sm:w-auto"
                        >
                            Upload File
                        </Button> */}
                        <Button
                            variant="solid"
                            size="sm"
                            className="flex items-center justify-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF] w-full sm:w-auto"
                            onClick={async () => {
                                await exportAllPagesToCSV<any, Record<string, unknown>>({
                                    endpoint: '/admin/properties/under-priced/list',
                                    filename: 'underpriced-properties.csv',
                                    basePayload: {
                                        search: searchTerm ?? '',
                                        is_displayed: true,
                                        sort: sort.key || undefined,
                                        sort_order: sort.order ? sort.order.toUpperCase() : undefined,
                                    },
                                    limitPerPage: 200,
                                    normalize: (r, idx) => {
                                        const base = normalizeUnderprice(r, idx) as unknown as Record<string, unknown>
                                        const priceNum = typeof r?.price === 'number' ? r.price : (typeof r?.amount === 'number' ? r.amount : undefined)
                                        const sqftRaw = r?.sqft ?? r?.square_feet ?? r?.squareFeet ?? r?.area ?? r?.livingArea ?? r?.size
                                        const sqftNum = typeof sqftRaw === 'number' ? sqftRaw : (sqftRaw != null && !isNaN(Number(sqftRaw)) ? Number(sqftRaw) : undefined)
                                        const pricePerSqft = priceNum && sqftNum ? `$${(priceNum / sqftNum).toFixed(2)}` : '-'
                                        return {
                                            ...base,
                                            zip: r?.zip ?? r?.zip_code ?? r?.zipcode ?? r?.postal_code ?? '-',
                                            sqft: r?.sqft ?? r?.square_feet ?? r?.squareFeet ?? r?.area ?? r?.livingArea ?? r?.size ?? '-',
                                            lotSize: r?.lot_size ?? r?.lotSize ?? r?.lot_sqft ?? r?.lotAcres ?? r?.lot_acres ?? '-',
                                            yearBuilt: r?.year_built ?? r?.yearBuilt ?? r?.built_year ?? '-',
                                            propertyType: r?.property_type ?? r?.propertyType ?? r?.type ?? '-',
                                            pricePerSqft,
                                            mlsId: r?.mls_id ?? r?.mlsId ?? r?.mls ?? '-',
                                            county: r?.county ?? r?.location?.county ?? '-',
                                            latitude: r?.lat ?? r?.latitude ?? r?.location?.lat ?? r?.location?.latitude ?? '-',
                                            longitude: r?.lng ?? r?.longitude ?? r?.location?.lng ?? r?.location?.longitude ?? '-',
                                            daysOnMarket: r?.dom ?? r?.days_on_market ?? r?.daysOnMarket ?? '-',
                                            status: r?.status ?? r?.listing_status ?? r?.sale_status ?? '-',
                                            url: r?.url ?? r?.link ?? r?.listing_url ?? '-',
                                        }
                                    },
                                    columns: [
                                        { header: 'Address', key: 'address' },
                                        { header: 'Bed', key: 'bed' },
                                        { header: 'Bath', key: 'bath' },
                                        { header: 'City', key: 'city' },
                                        { header: 'State', key: 'state' },
                                        { header: 'Price', key: 'price' },
                                        { header: 'ChatGPT Price Analysis', key: 'chatgptPriceAnalysis' },
                                        { header: 'Zip', key: 'zip' },
                                        { header: 'SqFt', key: 'sqft' },
                                        { header: 'Lot Size', key: 'lotSize' },
                                        { header: 'Year Built', key: 'yearBuilt' },
                                        { header: 'Property Type', key: 'propertyType' },
                                        { header: 'Price / SqFt', key: 'pricePerSqft' },
                                        { header: 'MLS ID', key: 'mlsId' },
                                        { header: 'County', key: 'county' },
                                        { header: 'Latitude', key: 'latitude' },
                                        { header: 'Longitude', key: 'longitude' },
                                        { header: 'Days on Market', key: 'daysOnMarket' },
                                        { header: 'Status', key: 'status' },
                                        { header: 'URL', key: 'url' },
                                    ],
                                })
                            }}
                        >
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

export default UnderpriceProperty 