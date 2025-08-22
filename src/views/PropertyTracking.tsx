import React, { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import DataTable from '@/components/shared/DataTable'
import {
    HiX
} from 'react-icons/hi'
import SearchIcon from '@/components/ui/SearchIcon'
import FilterIcon from '@/components/ui/FilterIcon'
 
import type { ColumnDef } from '@tanstack/react-table'
import DownloadIcon from '@/components/ui/DownloadIcon'
import ApiService from '@/services/ApiService'
import { exportAllPagesToCSV } from '@/utils/exportExcel'

interface PropertyTrackingData {
    id: string
    propertyName: string
    userName: string
    address: string
    price: string
    location: string
    customerType: string
    firstTrackedProperty: string
    bed: string
    bath: string
}

// CSV-only row shape (does not affect UI table)
type PropertyTrackingCsvRow = {
    id: string
    propertyName: string
    userName: string
    userEmail: string
    address: string
    price: string
    currency: string
    location: string
    city: string
    state: string
    country: string
    customerType: string
    firstTrackedProperty: string
    bed: string
    bath: string
    bedrooms: string
    bathrooms: string
    squareFeet: string
    propertyType: string
    createdAt: string
    updatedAt: string
    lastTrackedAt: string
    listingUrl: string
}

const PropertyTracking = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filterData, setFilterData] = useState({
        minPrice: '',
        maxPrice: '',
        location: '',
        customerType: '',
        firstTrackedProperty: '',
        beds: '',
        baths: ''
    })

    const [appliedFilters, setAppliedFilters] = useState({
        minPrice: '',
        maxPrice: '',
        location: '',
        customerType: '',
        firstTrackedProperty: '',
        beds: '',
        baths: ''
    })

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (showFilterModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup function to restore scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showFilterModal])

    

    const [items, setItems] = useState<PropertyTrackingData[]>([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState<{ key: string | number; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })

    const normalizeProperty = (item: any, index: number): PropertyTrackingData => {
        const id = item?.id?.toString?.() || `${index}`
        const user = item?.user || {}
        const subscription = item?.subscription || {}

        return {
            id,
            propertyName: subscription?.title || '-',
            userName: [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || user?.email || '-',
            address: user?.country || '-',
            price: item?.price || '-',
            location: user?.country || '-',
            customerType: user?.describe_yourself_option || '-',
            firstTrackedProperty: subscription?.description || '-',
            bed: '-',
            bath: '-',
        }
    }

    const fetchProperties = useCallback(async () => {
        setLoading(true)
        try {
            const offsetForBackend = pageIndex <= 1 ? 0 : pageIndex
            const payload: Record<string, unknown> = {
                search: searchTerm ?? '',
                min_price: appliedFilters.minPrice !== '' ? Number(appliedFilters.minPrice) : null,
                max_price: appliedFilters.maxPrice !== '' ? Number(appliedFilters.maxPrice) : null,
                city: appliedFilters.location || null,
                property_type: appliedFilters.firstTrackedProperty !== '' ? Number(appliedFilters.firstTrackedProperty) : null,
                bedrooms: appliedFilters.beds !== '' ? Number(appliedFilters.beds) : null,
                bathrooms: appliedFilters.baths !== '' ? Number(appliedFilters.baths) : null,
                sort: (sort.key as string) || 'created_at',
                sort_order: sort.order ? sort.order.toUpperCase() : 'DESC',
                limit: pageSize,
                offset: offsetForBackend,
            }

            const res = await ApiService.fetchData<any, typeof payload>({
                url: '/admin/properties/list',
                method: 'post',
                data: payload,
            })

            const body = res.data as any
            let rows: any[] = []
            let totalCount = 0

            if (body?.data && Array.isArray(body.data.data)) {
                rows = body.data.data
                totalCount = body.data.total ?? rows.length
            } else if (Array.isArray(body)) {
                rows = body
                totalCount = body.length
            } else if (body?.data) {
                const dataBlock = body.data as any
                rows = dataBlock.rows || dataBlock.list || dataBlock.items || []
                totalCount = dataBlock.total ?? body.total ?? rows.length
            } else {
                rows = body?.rows || body?.list || body?.items || []
                totalCount = body?.total ?? rows.length
            }

            const normalized = rows.map((r, idx) => normalizeProperty(r, idx))
            setItems(normalized)
            setTotal(typeof totalCount === 'number' ? totalCount : normalized.length)
        } catch (e) {
            setItems([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, searchTerm, sort, appliedFilters])

    useEffect(() => {
        const t = setTimeout(() => {
            fetchProperties()
        }, 300)
        return () => clearTimeout(t)
    }, [fetchProperties])

    // Table columns definition
    const columns: ColumnDef<PropertyTrackingData>[] = [
        {
            header: 'Property Name',
            accessorKey: 'propertyName',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        <span className="">{row.propertyName}</span>
                    </div>
                )
            }
        },
        {
            header: 'User Name',
            accessorKey: 'userName',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.userName}</span>
            }
        },
        {
            header: 'Address',
            accessorKey: 'address',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.address}</span>
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
            header: 'Location',
            accessorKey: 'location',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.location}</span>
            }
        },
        {
            header: 'Customer Type',
            accessorKey: 'customerType',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.customerType}</span>
            }
        },
        {
            header: 'First Tracked Property',
            accessorKey: 'firstTrackedProperty',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return <span className="">{row.firstTrackedProperty}</span>
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">Property Tracking</h1>
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
                        <Button
                            variant="solid"
                            size="sm"
                            className="!bg-[#4880FF] text-white !rounded-[19px] !p-[9px]"
                            onClick={() => setShowFilterModal(true)}
                        >
                            <FilterIcon className="w-5 h-5" size={20} />
                        </Button>
                        {/* <Button variant="solid" size="sm" className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF]">
                            Add Property
                        </Button> */}
                        <Button
                            variant="solid"
                            size="sm"
                            className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF]"
                            onClick={async () => {
                                await exportAllPagesToCSV<any, PropertyTrackingCsvRow>({
                                    endpoint: '/admin/properties/list',
                                    filename: 'property-tracking.csv',
                                    basePayload: {
                                        search: searchTerm ?? '',
                                        min_price: appliedFilters.minPrice !== '' ? Number(appliedFilters.minPrice) : null,
                                        max_price: appliedFilters.maxPrice !== '' ? Number(appliedFilters.maxPrice) : null,
                                        city: appliedFilters.location || null,
                                        property_type: appliedFilters.firstTrackedProperty !== '' ? Number(appliedFilters.firstTrackedProperty) : null,
                                        bedrooms: appliedFilters.beds !== '' ? Number(appliedFilters.beds) : null,
                                        bathrooms: appliedFilters.baths !== '' ? Number(appliedFilters.baths) : null,
                                        sort: (sort.key as string) || 'created_at',
                                        sort_order: sort.order ? sort.order.toUpperCase() : 'DESC',
                                    },
                                    limitPerPage: 200,
                                    normalize: (item, index) => {
                                        const id = item?.id?.toString?.() || `${index}`
                                        const user = item?.user || {}
                                        const subscription = item?.subscription || {}
                                        const propertyName = subscription?.title || '-'
                                        const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || user?.email || '-'
                                        const userEmail = user?.email || '-'
                                        const address = user?.country || '-'
                                        const price = item?.price?.toString?.() || item?.price || '-'
                                        const currency = item?.currency || '-'
                                        const location = user?.country || '-'
                                        const city = user?.city || item?.city || '-'
                                        const state = user?.state || item?.state || '-'
                                        const country = user?.country || item?.country || '-'
                                        const customerType = user?.describe_yourself_option || '-'
                                        const firstTrackedProperty = subscription?.description || '-'
                                        const bed = '-'
                                        const bath = '-'
                                        const bedrooms = (item?.bedrooms ?? '').toString() || '-'
                                        const bathrooms = (item?.bathrooms ?? '').toString() || '-'
                                        const squareFeet = item?.square_feet?.toString?.() || item?.sqft?.toString?.() || item?.sqft || '-'
                                        const propertyType = item?.property_type?.toString?.() || item?.property_type || '-'
                                        const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : '-'
                                        const updatedAt = item?.updated_at ? new Date(item.updated_at).toLocaleString() : '-'
                                        const lastTrackedAt = item?.last_tracked_at ? new Date(item.last_tracked_at).toLocaleString() : '-'
                                        const listingUrl = item?.url || item?.listing_url || '-'
                                        return { id, propertyName, userName, userEmail, address, price, currency, location, city, state, country, customerType, firstTrackedProperty, bed, bath, bedrooms, bathrooms, squareFeet, propertyType, createdAt, updatedAt, lastTrackedAt, listingUrl }
                                    },
                                    columns: [
                                        { header: 'Property ID', key: 'id' },
                                        { header: 'Property Name', key: 'propertyName' },
                                        { header: 'User Name', key: 'userName' },
                                        { header: 'User Email', key: 'userEmail' },
                                        { header: 'Address', key: 'address' },
                                        { header: 'Price', key: 'price' },
                                        { header: 'Currency', key: 'currency' },
                                        { header: 'Location', key: 'location' },
                                        { header: 'City', key: 'city' },
                                        { header: 'State', key: 'state' },
                                        { header: 'Country', key: 'country' },
                                        { header: 'Customer Type', key: 'customerType' },
                                        { header: 'First Tracked Property', key: 'firstTrackedProperty' },
                                        { header: 'Bed', key: 'bed' },
                                        { header: 'Bath', key: 'bath' },
                                        { header: 'Bedrooms', key: 'bedrooms' },
                                        { header: 'Bathrooms', key: 'bathrooms' },
                                        { header: 'Square Feet', key: 'squareFeet' },
                                        { header: 'Property Type', key: 'propertyType' },
                                        { header: 'Created At', key: 'createdAt' },
                                        { header: 'Updated At', key: 'updatedAt' },
                                        { header: 'Last Tracked At', key: 'lastTrackedAt' },
                                        { header: 'Listing URL', key: 'listingUrl' },
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

            {/* Filter Modal */}
            <Dialog
                isOpen={showFilterModal}
                onRequestClose={() => setShowFilterModal(false)}
                width={500}
                closable={false}
                contentClassName="p-0 rounded-[24px] bg-white shadow-[0_10px_20px_0_rgba(18,38,63,0.03)] mx-[20px] my-[4rem]"
            >
                <div className="">
                    <div className="flex justify-between items-center  px-4 py-4 border-b border-[#EFF2F7] ">
                        <h2 className="text-[#495057] font-nunito text-[18px] font-medium leading-none">
                            Filter Your Data
                        </h2>
                        <button
                            className="absolute top-[0px] right-4 text-[30px] text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowFilterModal(false)}
                        >
                            <HiX className='mt-[13px]' size={22} />
                        </button>
                    </div>

                    <div className="space-y-6 px-4 py-4">
                        {/* Price Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none mb-2">
                                    Minimum Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="$00"
                                    value={filterData.minPrice}
                                    onChange={(e) => setFilterData({ ...filterData, minPrice: e.target.value })}
                                    className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none mb-2">
                                    Maximum Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="$00"
                                    value={filterData.maxPrice}
                                    onChange={(e) => setFilterData({ ...filterData, maxPrice: e.target.value })}
                                    className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito  placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <div className="flex items-center mb-2">
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none">
                                    Location
                                </label>
                            </div>
                            <Input
                                type="text"
                                placeholder="Enter location"
                                value={filterData.location}
                                onChange={(e) => setFilterData({ ...filterData, location: e.target.value })}
                                className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                            />
                        </div>

                        {/* Customer Type */}
                        {/* <div>
                            <div className="flex items-center mb-2">
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none">
                                    Customer Type
                                </label>
                            </div>
                            <Select
                                placeholder="Select Customer Type"
                                options={[
                                    { value: 'homeowner', label: 'Homeowner' },
                                    { value: 'investor', label: 'Investor' }
                                ]}
                                value={filterData.customerType ? { value: filterData.customerType, label: filterData.customerType } : null}
                                onChange={(option) => setFilterData({ ...filterData, customerType: option?.value || '' })}
                                className="propertyslect w-full border-[#D5D5D5] bg-white [&_.select__placeholder]:text-[#202224] [&_.select__placeholder]:font-nunito [&_.select__placeholder]:text-[14px] [&_.select__placeholder]:not-italic [&_.select__placeholder]:font-normal [&_.select__placeholder]:leading-normal"
                                components={{
                                    DropdownIndicator: CustomDropdownIndicator
                                }}
                            />
                        </div> */}

                        {/* First Tracked Property */}
                        <div>
                            <div className="flex items-center mb-2">
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none">
                                    First Tracked Property
                                </label>
                            </div>
                            <Input
                                type="number"
                                placeholder="Enter first tracked property"
                                value={filterData.firstTrackedProperty}
                                onChange={(e) => setFilterData({ ...filterData, firstTrackedProperty: e.target.value })}
                                className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                            />
                        </div>

                        {/* Beds and Baths */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none mb-2">
                                    Numbers of Beds
                                </label>
                                <Input
                                    type="number"
                                    placeholder="00"
                                    value={filterData.beds}
                                    onChange={(e) => setFilterData({ ...filterData, beds: e.target.value })}
                                    className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[#495057] font-nunito text-[16px] not-italic font-semibold leading-none mb-2">
                                    Numbers of Baths
                                </label>
                                <Input
                                    type="number"
                                    placeholder="00"
                                    value={filterData.baths}
                                    onChange={(e) => setFilterData({ ...filterData, baths: e.target.value })}
                                    className="w-full rounded-[19px] border-[0.6px] border-[#D5D5D5] bg-white placeholder:text-[#202224] placeholder:font-nunito  placeholder:text-[14px] placeholder:not-italic placeholder:font-normal placeholder:leading-none placeholder:opacity-50"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4 mt-8">
                            <Button
                                variant="solid"
                                size="sm"
                                className="!rounded-[24px] border !border-[#B6B6B6] !bg-[#B6B6B6] !text-[#353738] font-nunito text-[13px] not-italic font-medium leading-normal px-[34px] py-[7px]"
                                onClick={() => setShowFilterModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                className="!rounded-[24px] border !border-[#4880FF] !bg-[#4880FF] text-white font-nunito text-[13px] not-italic font-medium leading-normal px-[34px] py-[7px]"
                                onClick={() => {
                                    setAppliedFilters(filterData)
                                    setPageIndex(1)
                                    setShowFilterModal(false)
                                }}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>

                    {/* Modal Buttons */}
                </div>
            </Dialog>
        </div>
    )
}

export default PropertyTracking 