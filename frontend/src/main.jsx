import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { Tooltip } from "radix-ui";
import { Appearance } from "./App";
import Chime from "./Chime";
import { ErrorBoundary } from "./components/ui";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tooltip.Provider delayDuration={350}>
        <ErrorBoundary>
          <Appearance>
            <Chime />
          </Appearance>
        </ErrorBoundary>
      </Tooltip.Provider>
    </MotionConfig>
  </StrictMode>,
);
