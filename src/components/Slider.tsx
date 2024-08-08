import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface SliderProps {
	children: React.ReactNode;
	slidesToScroll?: number;
	slidesToShow?: number;
	responsive?: { [key: string]: { items: number } };
	autoPlay?: boolean;
	autoPlaySpeed?: number;
	gap?: number;
	infinite?: boolean;
	getSliderActionsAndState?: (props: SliderActionsAndState) => void;
}

export interface SliderActionsAndState {
	prevSlide: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	nextSlide: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	currentSlide: number;
	totalSlides: number;
	prevSlideButtonDisabled: boolean;
	nextSlideButtonDisabled: boolean;
}

const Slider = ({
	children,
	slidesToShow = 1,
	slidesToScroll = 1,
	responsive,
	autoPlay,
	autoPlaySpeed = 5000,
	gap = 10,
	infinite = false,
	getSliderActionsAndState,
}: SliderProps) => {
	const [currentSlide, setCurrentSlide] = useState(infinite ? slidesToShow : 0);
	const [transition, setTransition] = useState(false);
	const [slideWidth, setSlideWidth] = useState(0);
	const [slidesToShowPerPage, setSlidesToShowPerPage] = useState(infinite ? slidesToShow : 0);

	const totalSlides = React.Children.count(children);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!responsive) return;

		const updateSlidesToShow = () => {
			const width = window.innerWidth;
			let slides = 1;

			for (const breakpoint in responsive) {
				if (responsive.hasOwnProperty(breakpoint) && width >= parseInt(breakpoint, 10)) {
					slides = responsive[breakpoint].items;
				}
			}

			setSlidesToShowPerPage(slides);

			if (containerRef.current) {
				const containerWidth = containerRef.current.offsetWidth;
				setSlideWidth(containerWidth / slides - gap);
			}
		};

		updateSlidesToShow();
		window.addEventListener("resize", updateSlidesToShow);

		return () => window.removeEventListener("resize", updateSlidesToShow);
	}, []);

	useEffect(() => {
		if (!autoPlay) return;

		const interval = setInterval(() => {
			throttledNextSlide();
		}, autoPlaySpeed);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const isFunction = typeof getSliderActionsAndState === "function";

		if (!isFunction) return;

		const actionsAndState = {
			prevSlide: throttledPrevSlide,
			nextSlide: throttledNextSlide,
			currentSlide,
			totalSlides,
			prevSlideButtonDisabled: infinite ? false : currentSlide === 0,
			nextSlideButtonDisabled: infinite ? false : currentSlide + slidesToShowPerPage >= totalSlides,
		};

		getSliderActionsAndState(actionsAndState);
	}, [currentSlide]);

	const nextSlide = () => {
		if (currentSlide < totalSlides + slidesToShowPerPage) {
			setTransition(true);
			setCurrentSlide((prevSlide) => prevSlide + slidesToScroll);
		}
	};

	const prevSlide = () => {
		setTransition(true);
		setCurrentSlide((prevSlide) => {
			const newSlide = prevSlide - slidesToScroll;
			return Math.max(newSlide, 0);
		});
	};

	const throttledNextSlide = useCallback(throttle(nextSlide, 500), []);
	const throttledPrevSlide = useCallback(throttle(prevSlide, 500), []);

	const handleTransitionEnd = () => {
		if (!infinite) return;

		setTransition(false);

		if (currentSlide >= totalSlides + slidesToShowPerPage) {
			setCurrentSlide((prev) => prev - totalSlides);
		} else if (currentSlide <= 0) {
			setCurrentSlide(totalSlides);
		}
	};

	const clonedSlides = infinite
		? [
				...React.Children.toArray(children).slice(totalSlides - slidesToShowPerPage),
				...React.Children.toArray(children),
				...React.Children.toArray(children).slice(0, slidesToShowPerPage + slidesToShowPerPage),
		  ]
		: children;

	const totalLength = Array.isArray(clonedSlides) ? clonedSlides.length : totalSlides;

	return (
		<section className="relative">
			<div ref={containerRef} className="overflow-hidden">
				<div
					className={`flex transition ease-in-out ${transition ? "duration-500" : "duration-0"}`}
					style={{
						transform: `translate3d(-${currentSlide * (slideWidth + gap)}px, 0, 0)`,
						width: `${(totalLength / slidesToShowPerPage) * 100}%`,
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					{React.Children.map(clonedSlides, (child, index) => (
						<div
							className="flex-shrink-0 w-full h-96 bg-green-600 flex justify-center items-center text-4xl text-white"
							style={{ width: `${slideWidth}px`, margin: `0 ${gap / 2}px` }}
							key={index}
						>
							{child}
						</div>
					))}
				</div>
			</div>
			<button
				className="absolute top-1/2 left-5 z-30 transform -translate-y-1/2 bg-black/50 text-white size-10 flex justify-center items-center rounded-full hover:bg-black/70 active:bg-black/40"
				onClick={prevSlide}
				disabled={!infinite && currentSlide === 0}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="3"
					stroke="currentColor"
					className="size-6 mr-1"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
				</svg>
			</button>
			<button
				className="absolute top-1/2 right-5 z-30 transform -translate-y-1/2 bg-black/50 text-white size-10 flex justify-center items-center rounded-full hover:bg-black/70 active:bg-black/40"
				onClick={nextSlide}
				disabled={!infinite && currentSlide + slidesToShowPerPage >= totalSlides}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="3"
					stroke="currentColor"
					className="size-6 ml-1"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
				</svg>
			</button>
		</section>
	);
};

export default memo(Slider);

function throttle(func: Function, delay: number) {
	let prev = 0;
	return (args?: any) => {
		let now = new Date().getTime();

		if (now - prev > delay) {
			prev = now;
			return func(args);
		}
	};
}
