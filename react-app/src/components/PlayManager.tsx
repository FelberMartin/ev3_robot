import { useState, useEffect } from 'react';

interface Props {
    onUpdate: (index: number, durationMs: number) => void;
    durations: number[];
}


const PlayManager = ({ onUpdate, durations }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [durations]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const playNextPair = () => {
      const start  = durations[0];
      if (currentIndex < durations.length - 1) {
        const timestamp1 = durations[currentIndex];
        const timestamp2 = durations[currentIndex + 1];
        
        // Calculate the duration between timestamp1 and timestamp2
        const duration = timestamp2 - timestamp1;

        // Update the data
        onUpdate(currentIndex, timestamp1 - start);

        // Move to the next pair of timestamps after the duration
        timer = setTimeout(() => {
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, duration);
      } else {
        onUpdate(currentIndex, durations[currentIndex] - start);
        console.log("Playback finished");
        // Playback finished, stop playing
        setIsPlaying(false);
        setIsFinished(true);
      }
    };

    if (isPlaying) {
      playNextPair();
    }

    // Clean up timer on component unmount or when playback stops
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const handlePlayClick = () => {
    if (isPlaying) {
      // Stop playback by setting isPlaying to false
      setIsPlaying(false);
    } else {
      if (isFinished) {
        // Reset the playback
        setCurrentIndex(0);
        setIsFinished(false);
        setIsPlaying(false); 
        onUpdate(0, 0);
      } else {
        // Start playback by setting isPlaying to true
        setIsPlaying(true);
      }

    }
  };

  return (
    <div>
      <button
      onClick={handlePlayClick}
      className="btn btn-primary play" // Use Bootstrap button classes
      disabled={durations.length === 0}
    >
      {isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
        </svg>
      ) : (isFinished ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
          <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" fill="currentColor" viewBox="0 0 16 16">
          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
        </svg>
      ))}

    </button>
    </div>
  );
};

export default PlayManager;
