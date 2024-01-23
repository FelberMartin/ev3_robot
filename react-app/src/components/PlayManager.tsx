import { on } from 'events';
import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons CSS


interface Props {
    onUpdate: (index: number, durationMs: number) => void;
    timestamps: Date[];
}


const PlayManager = ({ onUpdate, timestamps }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [timestamps]);

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
        onUpdate(currentIndex, timestamps[currentIndex].getTime() - start);
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
      // Start playback by setting isPlaying to true
      setIsFinished(false);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <button
      onClick={handlePlayClick}
      className="btn btn-primary play" // Use Bootstrap button classes
      disabled={timestamps.length === 0}
    >
      {isPlaying ? (
        <i className="bi-pause-fill" style={{fontSize: "30px", color: "white"}} ></i>
      ) : (isFinished ? (
        <i className="bi-arrow-repeat" style={{fontSize: "30px", color: "white"}} ></i>
      ) : (
        <i className="bi-play-fill" style={{fontSize: "30px", color: "white"}} ></i>
      ))}

    </button>
    </div>
  );
};

export default PlayManager;
