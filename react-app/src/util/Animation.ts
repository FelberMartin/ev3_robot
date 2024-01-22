// Function to smoothly update the animated values
const animateValue = (currentValue, targetValue, setterFunction, durationMs = 400) => {
  const framesPerSecond = 120;
  const totalFrames = durationMs / (1000 / framesPerSecond);
  const frameIncrement = (targetValue - currentValue) / totalFrames;

  let currentFrame = 0;

  const animate = () => {
    currentFrame++;
    const nextValue = currentValue + frameIncrement;
    setterFunction(nextValue);

    if (currentFrame < totalFrames) {
      currentValue = nextValue;
      requestAnimationFrame(animate);
    }
  };

  animate();
};

export { animateValue };