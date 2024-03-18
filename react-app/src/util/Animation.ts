// Function to smoothly update the animated values
const animateValue = (currentValue: number, targetValue: number, setterFunction: (arg0: number) => any, durationMs = 200) => {
  if (targetValue === currentValue) {
    return;
  }
  if (durationMs === 0) {
    setterFunction(targetValue);
    return;
  }

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