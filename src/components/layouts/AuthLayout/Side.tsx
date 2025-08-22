import { cloneElement } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import Avatar from '@/components/ui/Avatar'
import Logo from '@/components/template/Logo'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import '@/assets/styles/components/_testimonial-slider.css'

// Testimonial data
const testimonials = [
    {
        id: 1,
        stat: "5k+",
        title: "Satisfied clients",
        text: "Lorem ipsum dolor sit amet consectetur. Ultrices commodo lorem scelerisque magna eu pellentesque faucibus. Euismod vulputate lectus ac quis at eget accumsan. Ullamcorper iaculis convallis tortor etiam dictumst. Tellus enim felis commodo id donec nunc amet et.",
        author: "Abs2023"
    },
    {
        id: 2,
        stat: "10k+",
        title: "Happy customers",
        text: "Lorem ipsum dolor sit amet consectetur. Ultrices commodo lorem scelerisque magna eu pellentesque faucibus. Euismod vulputate lectus ac quis at eget accumsan. Ullamcorper iaculis convallis tortor etiam dictumst. Tellus enim felis commodo id donec nunc amet et.",
        author: "RealEstate2024"
    },
    {
        id: 3,
        stat: "15k+",
        title: "Successful deals",
        text: "Lorem ipsum dolor sit amet consectetur. Ultrices commodo lorem scelerisque magna eu pellentesque faucibus. Euismod vulputate lectus ac quis at eget accumsan. Ullamcorper iaculis convallis tortor etiam dictumst. Tellus enim felis commodo id donec nunc amet et.",
        author: "PropertyPro"
    }
]

interface SideProps extends CommonProps {
    content?: React.ReactNode
}

const Side = ({ children, content, ...rest }: SideProps) => {
    console.log('Side component rendered', { children, content })

    return (
                <div className="grid grid-cols-12 h-full">
            {/* Left side - Testimonial card */}
            <div className="col-span-12 md:col-span-7 lg:col-span-7 xl:col-span-8 flex flex-col justify-center items-center bg-white dark:bg-gray-800 relative">
                {/* Background image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('/img/images/loginbg.png')`,
                    }}
                />
                
                {/* Testimonial card */}
                <div className="relative z-10 w-[85%] sm:w-[80%] md:w-[85%] lg:w-[80%] xl:w-[70%]">
                    <div className="testislide bg-white/80 backdrop-blur-sm rounded-[42px] shadow-xl p-6 sm:p-8 md:p-10 lg:p-12 xl:pt-[60px] xl:px-[55px] xl:pb-[55px] relative">
                        <div className="absolute top-[-20px] sm:top-[-25px] md:top-[-30px] lg:top-[-33px] right-[15px] sm:right-[20px] md:right-[26px]">
                            <img
                                src="/img/images/bxs-quote-alt-left.png"
                                alt="Quote"
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-[#4880FF]"
                            />
                        </div>
                        
                        {/* Swiper Container */}
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            spaceBetween={0}
                            slidesPerView={1}
                            pagination={{
                                clickable: true,
                                el: '.swiper-pagination',
                                bulletClass: 'swiper-pagination-bullet',
                                bulletActiveClass: 'swiper-pagination-bullet-active'
                            }}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            loop={true}
                            className="testimonial-swiper"
                        >
                            {testimonials.map((testimonial) => (
                                <SwiperSlide key={testimonial.id}>
                                    <div className="relative">
                                        <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] xl:text-[32px] font-bold font-nunito text-black leading-tight mb-4 sm:mb-6 md:mb-8 lg:mb-[36px]">
                                            <span className="text-[#4880FF]">{testimonial.stat}</span>
                                            <span className='ml-2 sm:ml-3 md:ml-4 lg:ml-[10px]'>{testimonial.title}</span>
                                        </h2>
                                        <p className="text-black font-nunito text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-medium leading-relaxed sm:leading-[28px] md:leading-[32px] lg:leading-[36px] mb-4 sm:mb-6 md:mb-8 lg:mb-[26px]">
                                            {testimonial.text}
                                        </p>
                                        <div className="text-blue-600 font-semibold text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] mb-4 sm:mb-6 md:mb-8 lg:mb-[25px]">
                                            {testimonial.author}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        
                        {/* Custom Pagination */}
                        <div className="swiper-pagination !bottom-0 !left-0 !w-auto !static mt-4 sm:mt-5 md:mt-6"></div>
                    </div>
                </div>
            </div>
            
            {/* Right side - Login form */}
            <div className="col-span-12 md:col-span-5 lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-center bg-[#2A3042] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0">
                <div className="w-full max-w-[400px] xl:min-w-[400px]">
                    {content && <div className="mb-6 sm:mb-8">{content}</div>}
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Side
