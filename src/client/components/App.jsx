import axios from 'axios';
import './App.css'

import { useState, useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';

import RainRadarImage from './RainRadarImage.jsx';

function App() {
  const [images, setImages] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [earliestImageIndex, setEarliestImageIndex] = useState(0);
  const [isFixed, setIsFixed] = useState(false); // track if the next frame should be the same as before of truly a different image
  // const shortIntervalIdRef = useRef(null);
  const [isManual, setIsManual] = useState(false); // track if the slider is being used
  const longIntervalIdRef = useRef(null);

  async function fetchData() {
    try {
      const response = await axios.get('http://localhost:3000/rain-radar/12hrs');
      return response.data; //setImages(response.data);
    } catch (error) {
      console.error(error);
      return [];
    }
  }  
  
  async function refreshData() {
    const imagesList = await fetchData();
    if (imagesList.length !== 0) {
      setImages(imagesList);
    }
    else {
      setImages((prevImages) => {
        return [
          ...prevImages.slice(1,-1),
          '/NoRain404.png'
        ]
      });
    }
  }
  
  useEffect(() => {
    function nextFrame() {
      if (!isManual) {
        if (isFixed) {
          setFrameIndex(frameIndex);
        }
        else if ((frameIndex + 1) % (images.length || 1) == 0) {
          setFrameIndex(earliestImageIndex);
        } 
        else {
          setFrameIndex(frameIndex + 1);
        }
      }
    }
    if (!isManual) {
      const shortIntervalId = setTimeout(nextFrame, 1000);
      return () => clearTimeout(shortIntervalId);
    }
  }, [frameIndex, images.length, isManual, isFixed]); // Add isManual to the dependencies array
  
  useEffect(() => {  
    refreshData();
    
    clearInterval(longIntervalIdRef.current); 
    longIntervalIdRef.current = setInterval(refreshData, 320000); 

    return () => clearInterval(longIntervalIdRef.current); // Cleanup by clearing the interval
  }, []);

  // Handle change for the earliest image index
  function handleEarliestIndexChange(event) {
    const timeSpan = parseInt(event.target.value, 10)
    if (timeSpan == 0) {
      setIsFixed(true);
      setFrameIndex(images.length - 1);
    } 
    else {
      setIsFixed(false);
      const index = Math.max(1, Math.min(12, timeSpan)); // Ensure the value is within 1 to 12
      setEarliestImageIndex((12 - index) * 12); // Calculate the actual index for the images array
      if (frameIndex < (12 - index) * 12) {
        setFrameIndex((12 - index) * 12);
      }
    }
  }
  
  function handleSliderChange(event) {
    setFrameIndex(parseInt(event.target.value, 10));
    setIsManual(true); // Set isManual to true when the slider is used
  }

  function handleSliderRelease() {
    setIsManual(false); // Set isManual back to false when the slider is released
  }
  
  return (
    <>
      <div className="card">
        <RainRadarImage src={images[Math.max(earliestImageIndex, frameIndex)]} />
        <Slider
          min={0}
          max={12}
          defaultValue={12}
          onChange={handleEarliestIndexChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          className="slider timespanner"
        />
        <Slider 
          min={earliestImageIndex}
          max={images.length - 1}
          value={frameIndex}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className="slider framer"
        />
        {/* <RainRadarImage 
          // or "https://www.weather2day.co.il/radar.php" 
          // but it won't be able to update, so I keep it the current way
          src={images[images.length - 1]} 
        /> */}
      </div>
    </>
  )
}


export default App;