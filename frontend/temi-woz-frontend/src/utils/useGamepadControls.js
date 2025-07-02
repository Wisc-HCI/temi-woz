import { useEffect, useRef } from "react";

const commandMap = {
  12: "skidJoy",
  13: "skidJoy",
  14: "turnBy",
  15: "turnBy",
  0: "tiltBy",
  3: "tiltBy",
}

const dpadMap = {
  12: "(0.5, 0)",
  13: "(-0.5, 0)",
  14: "10",
  15: "-10",
  0: "-5",
  3: "5",
};


export function useGamepadControls(sendMessage, setPressedButtons) {
  const animationRef = useRef();
  const repeatTimers = useRef({});
  const prevButtonStates = useRef({});
  const setPressedButtonsRef = useRef(setPressedButtons);

  const handlePress = (index) => {
    console.log("handlePress: ", index)
    const dir = dpadMap[index];
    if (!dir) return;

    // Send immediately
    sendMessage({
      command: commandMap[index],
      payload: dpadMap[index]
    });


    // Clear any existing repeat timer
    clearInterval(repeatTimers.current[index]);

    // Set up repeat every 2 seconds
    repeatTimers.current[index] = setInterval(() => {
      console.log("sending message!  ", index)
      sendMessage({
        command: commandMap[index],
        payload: dpadMap[index]
      });
    }, 300);

  };

  const handleRelease = (index) => {
    console.log("handleRelease: ", index)
    clearInterval(repeatTimers.current[index]);
    delete repeatTimers.current[index];
  };



  useEffect(() => {
      setPressedButtonsRef.current = setPressedButtons;
    }, [setPressedButtons]);


  useEffect(() => {

    const logGamepadState = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {

          const pressed = [];

          gamepad.buttons.forEach((button, index) => {
            if (dpadMap[index]) {
              const isPressed = button.pressed;
              const wasPressed = prevButtonStates.current[index] || false;

              if (isPressed && !wasPressed) {
                handlePress(index);
              } else if (!isPressed && wasPressed) {
                handleRelease(index);
              }

              prevButtonStates.current[index] = isPressed;
              if (isPressed) pressed.push(index);
            }
          });

          setPressedButtonsRef.current?.(pressed);

        }
      }
      animationRef.current = requestAnimationFrame(logGamepadState);
    };

    
    animationRef.current = requestAnimationFrame(logGamepadState);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationRef.current);
      Object.values(repeatTimers.current).forEach(clearInterval);
      console.log("useEffect cleanup: canceling all intervals");
    };

  }, []);
}
