import { Box } from "@mui/material";

export type SignalLevel = "strong" | "medium" | "weak" | "bad";

interface SignalBarsProps {
  level: SignalLevel;
}

export function SignalBars({ level }: SignalBarsProps) {
  const activeBars =
    level === "strong" ? 4 : level === "medium" ? 3 : level === "weak" ? 2 : 1;

  const color =
    level === "strong"
      ? "#22c55e" // green
      : level === "medium"
        ? "#eab308" // yellow
        : level === "weak"
          ? "#f97316" // orange
          : "#ef4444"; // red

  return (
    <Box sx={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6 + i * 4, // stepped height
            borderRadius: 1,
            bgcolor: i < activeBars ? color : "rgba(255,255,255,0.15)",
            transition: "background-color 0.2s ease",
          }}
        />
      ))}
    </Box>
  );
}
