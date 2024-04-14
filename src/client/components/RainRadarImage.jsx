import './RainRadarImage.css';

function RainRadarImage({src}) {
    const defaultRadarImage = '/NoRain404.png';

    function handleImageOnError(e) {
        e.target.src = defaultRadarImage;
        e.target.onError = null;
    }

    return (
        <img
            onError={handleImageOnError}
            src={src}
            alt="rain radar image"
        />
    );
}

export default RainRadarImage;