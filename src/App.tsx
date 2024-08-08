import { useEffect, useState } from "react";
import Slider, { SliderActionsAndState } from "./components/Slider";

function App() {
	const [sliderActionsAndState, setSliderActionsAndState] = useState<SliderActionsAndState | null>(
		null
	);

	useEffect(() => {
		console.log(sliderActionsAndState);
	}, [sliderActionsAndState]);

	const settings = {
		// dots: true,
		infinite: true,
		// speed: 500,
		slidesToShow: 3,
		slidesToScroll: 3,
		// autoPlay: true,
		gap: 20,
		responsive: {
			0: {
				items: 1,
			},
			600: {
				items: 3,
			},
		},
	};

	return (
		<>
			<div className="max-w-screen-lg mx-auto mt-24">
				<Slider {...settings} getSliderActionsAndState={setSliderActionsAndState}>
					<div>Slide 1</div>
					<div>Slide 2</div>
					<div>Slide 3</div>
					<div>Slide 4</div>
					<div>Slide 5</div>
					<div>Slide 6</div>
					<div>Slide 7</div>
					<div>Slide 8</div>
				</Slider>
				<div className="flex justify-between mt-4">
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded"
						onClick={sliderActionsAndState?.prevSlide}
						disabled={sliderActionsAndState?.prevSlideButtonDisabled}
					>
						Prev
					</button>
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded"
						onClick={sliderActionsAndState?.nextSlide}
						disabled={sliderActionsAndState?.nextSlideButtonDisabled}
					>
						Next
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
