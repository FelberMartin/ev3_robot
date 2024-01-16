import React, { useState, useEffect } from 'react';

interface Props {
    onUpdate: (index: number, durationMs: number) => void;
    timestamps: Date[];
}


const PlayManager = ({ onUpdate, timestamps }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const playNextPair = () => {
      const start  = timestamps[0].getTime();
      if (currentIndex < timestamps.length - 1) {
        const timestamp1 = timestamps[currentIndex].getTime();
        const timestamp2 = timestamps[currentIndex + 1].getTime();
        
        // Calculate the duration between timestamp1 and timestamp2
        const duration = timestamp2 - timestamp1;

        // Update the data
        onUpdate(currentIndex, timestamp1 - start);

        // Move to the next pair of timestamps after the duration
        timer = setTimeout(() => {
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, duration);
      } else {
        console.log("Playback finished");
        // Playback finished, stop playing
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      playNextPair();
    }

    // Clean up timer on component unmount or when playback stops
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const handlePlayClick = () => {
    // Start playback by setting isPlaying to true
    setIsPlaying(true);
  };

  const handleStopClick = () => {
    // Stop playback by setting isPlaying to false
    setIsPlaying(false);
  };

  return (
    <div>
      <button onClick={handlePlayClick} disabled={isPlaying}>
        Play
      </button>
      <button onClick={handleStopClick} disabled={!isPlaying}>
        Stop
      </button>
    </div>
  );
};

export default PlayManager;
