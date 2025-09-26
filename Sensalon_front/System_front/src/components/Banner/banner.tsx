import React, { useCallback, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
type Slide = {
    iIdSliderImage: string
    vcurl_img: string
}
type BannerSliderProps = {
    slides: Slide[]
    autoplaySpeed?: number
}
const BannerSlider: React.FC<BannerSliderProps> = ({
    slides,
    autoplaySpeed = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    console.log(slides)
    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, [slides.length])
    const goToPrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
        )
    }
    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }
    useEffect(() => {
        let interval: any
        if (isAutoPlaying) {
            interval = setInterval(goToNext, autoplaySpeed)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isAutoPlaying, goToNext, autoplaySpeed])
    const handleMouseEnter = () => {
        setIsAutoPlaying(false)
    }
    const handleMouseLeave = () => {
        setIsAutoPlaying(true)
    }
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            goToPrev()
        } else if (e.key === 'ArrowRight') {
            goToNext()
        }
    }
    return (
        <div
            className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Promotional banners"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div
                        className="relative w-full h-full bg-cover bg-center rounded-2xl"
                        style={{
                            backgroundImage: `url(${slides[currentIndex]?.vcurl_img})`,
                        }}
                    >
                    </div>
                </motion.div>
            </AnimatePresence>
            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
            {/* Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentIndex ? 'true' : 'false'}
                    />
                ))}
            </div>
        </div>
    )
}
export default BannerSlider
