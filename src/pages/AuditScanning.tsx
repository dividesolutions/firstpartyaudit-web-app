import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import PageLoading from "../components/PageLoading";
import { useParams } from "react-router";
import customAxios from "../lib/customAxios";
import { useState, useEffect } from "react";

interface AuditScanningProps {
  id: string;
  url: string;
  status: "pending" | "in_progress" | "finished" | "failed";
  progress: number;
  result_json: object | null;
  error: string | null;
  created_at: string;
  upadated_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export default function AuditScanning() {
  const { auditId } = useParams<{ auditId: string }>();
  const [auditData, setAuditData] = useState<AuditScanningProps | null>(null);
  const [email, setEmail] = useState("");

  //Two states to display next button
  const [isFinished, setIsFinished] = useState(false);
  const [isEmailSet, setIsEmailSet] = useState(false);

  const fetchResults = async () => {
    try {
      const response = await customAxios.get(`/audits/${auditId}`);
      console.log("Audit:", response.data);
      if (response.data.status === "finished") {
        setAuditData(response.data);
        setIsFinished(true);
      }
      if (response.data.email && !isEmailSet) {
        setIsEmailSet(true);
      }
    } catch (error) {
      console.error("Error fetching audit status:", error);
    }
  };

  const appendEmail = async (email: string) => {
    try {
      const response = await customAxios.patch(`/audits/${auditId}/email`, {
        email: email.trim(),
      });
      console.log("Email appended:", response.data);
      setIsEmailSet(true);
    } catch (error) {
      console.error("Error appending email:", error);
    }
  };

  useEffect(() => {
    if (!auditId || isFinished) return;

    fetchResults(); // initial fetch

    const interval = setInterval(fetchResults, 5000);

    return () => clearInterval(interval);
  }, [auditId, isFinished, isEmailSet]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0B0B10",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        {/* <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        > */}

        {!isFinished ? (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                width: "100%",
                textAlign: "left",
              }}
            >
              Running website audit…
            </Typography>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                my: 4,
              }}
            >
              <PageLoading height="20vh" width="100%" />
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "left",
                maxWidth: 520,
                mb: 6,
              }}
            >
              Hang tight — we’re analyzing requests, cookies, and platform
              signals.
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                width: "100%",
                textAlign: "left",
              }}
            >
              Audit complete!
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "left",
                maxWidth: 520,
                mb: 6,
              }}
            >
              Your audit is complete. Enter your email below to receive the
              results.
            </Typography>
          </>
        )}
        {/* Email capture */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Enter your email to see your audit results
          </Typography>

          <TextField
            fullWidth
            type="email"
            label="Email address"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: { color: "rgba(255,255,255,0.65)" },
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        ml: 1,
                        textTransform: "none",
                        borderRadius: 1.5,
                        bgcolor: "rgba(143,0,255,0.85)",
                        "&:hover": {
                          bgcolor: "rgba(143,0,255,1)",
                        },
                      }}
                      disabled={!email}
                      onClick={() => {
                        appendEmail(email);
                      }}
                    >
                      Submit
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
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

          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.55)" }}
          >
            We’ll only use this to send your audit results.
          </Typography>
        </Box>
        {/* </Box> */}
      </Container>
    </Box>
  );
}
