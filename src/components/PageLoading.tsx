import { Box } from "@mui/material";
import { keyframes } from "@mui/system";
import { useMediaQuery } from "@mui/system";

const shimmer = keyframes`
  0%   { background-position: -100% 0; opacity: 0.55; }
  50%  { opacity: 1; }
  100% { background-position: 100% 0; opacity: 0.55; }
`;

type PageLoadingProps = {
  height?: string | number;
  width?: string | number;
  bars?: number;
};

export default function PageLoading({ height, width, bars }: PageLoadingProps) {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const barCount = bars ?? (isSmallScreen ? 10 : 12);

  const durationSec = 3.6;
  const phaseStepSec = durationSec / Math.max(1, barCount);

  return (
    <Box
      sx={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          gap: { xs: 1.5, sm: 2.5, md: 3 },
          height: "100%",
          width: "100%",
          maxWidth: 720,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: "100%",
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,

                // The trick: big gradient + animated background-position
                backgroundImage:
                  "linear-gradient(270deg, transparent 0%, rgba(143,0,255,0.95) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: `${shimmer} ${durationSec}s cubic-bezier(0.4,0,0.2,1) infinite`,

                animationDelay: `-${i * phaseStepSec}s`,

                // ✅ helps prevent first-paint jank / banding
                willChange: "background-position, opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
