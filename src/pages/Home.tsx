import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import customAxios from "../lib/customAxios";
import SnackbarAlert from "../components/SnackBarAlert";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [apiCalled, setApiCalled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const runAudit = async () => {
    const normalizeUrl = (input: string): string | null => {
      try {
        const trimmed = input.trim();

        // If no scheme is provided, default to https
        const withProtocol = trimmed.match(/^https?:\/\//i)
          ? trimmed
          : `https://${trimmed}`;

        const parsed = new URL(withProtocol);

        // Basic sanity check: must have a hostname and a dot
        if (!parsed.hostname || !parsed.hostname.includes(".")) {
          return null;
        }

        return parsed.toString();
      } catch {
        return null;
      }
    };

    const payload = { url: normalizeUrl(url), email: null };
    try {
      setLoading(true);
      const response = await customAxios.post("/audits", payload);
      setApiCalled(true);
      console.log("Audit created:", response.data.id);
      navigate(`/audit/${response.data.id}`);
    } catch (error) {
      console.error("Error running audit:", error);
      setSnackbarMessage(
        "Failed to start audit. Please check the URL and try again."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const canSubmit = Boolean(url.trim()) && !apiCalled;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0B0B10",
        color: "common.white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(900px 600px at 20% 25%, rgba(143,0,255,0.28), transparent 60%),
            radial-gradient(700px 500px at 80% 65%, rgba(90,200,250,0.14), transparent 55%)
          `,
        }}
      />

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          py: { xs: 8, md: 12 },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.55)",
              mb: 1,
            }}
          >
            First Party Audit
          </Typography>

          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Website Tracking & Signal Analysis
          </Typography>
        </Box>
        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.05,
            fontSize: { xs: "2.4rem", sm: "3rem", md: "3.5rem" },
            mb: 2,
            textAlign: "center",
          }}
        >
          Audit your tracking.
          <Box
            component="span"
            sx={{
              display: "block",
              mt: 1,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
            }}
          >
            See how First Party can improve signal quality and resilience.
          </Box>
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.75)",
            maxWidth: 720,
            mx: "auto",
            mb: 5,
            fontSize: "1.05rem",
          }}
        >
          Run a live audit on any site to understand cookie health, platform
          dependencies, and where first-party architecture can materially
          increase performance.
        </Typography>

        {/* Scan Box */}
        <Paper
          elevation={0}
          sx={{
            maxWidth: 560,
            mx: "auto",
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            boxShadow:
              "0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(143,0,255,0.08)",
            position: "relative",
          }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700, color: "white" }}>
              Scan a website
            </Typography>

            <TextField
              fullWidth
              label="Website URL"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.7)" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "common.white",
                  bgcolor: "rgba(0,0,0,0.25)",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.16)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.28)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(143,0,255,0.7)",
                  },
                },
              }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={runAudit}
              disabled={!canSubmit}
              sx={{
                py: 1.25,
                fontWeight: 800,
                textTransform: "none",
                background:
                  "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
                boxShadow: "0 18px 55px rgba(143,0,255,0.25)",
              }}
            >
              Run audit
            </Button>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              The scan analyzes publicly observable requests, cookies, and
              platform signals. No credentials required.
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <SnackbarAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
        autoHideDuration={6000}
      />
    </Box>
  );
}
