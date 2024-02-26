// Function to smoothly update the animated values
const animateValue = (currentValue, targetValue, setterFunction, durationMs = 400) => {

  var start = Date.now();

  const animate = () => {
    const now = Date.now();
    var elapsed = now - start;
    if (elapsed > durationMs) {
      setterFunction(targetValue);
      return;
    }

    const nextValue = currentValue + (targetValue - currentValue) * elapsed / durationMs;
    setterFunction(nextValue);

    if (elapsed < durationMs) {
      requestAnimationFrame(animate);
    }
  };

  animate();
};

export { animateValue };