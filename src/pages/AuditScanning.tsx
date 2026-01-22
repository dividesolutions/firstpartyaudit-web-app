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
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();
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

  const auditResults = () => {
    navigate(`/audit/${auditId}/results`);
  };

  useEffect(() => {
    if (!auditId || isFinished) return;

    fetchResults(); // initial fetch

    const interval = setInterval(fetchResults, 5000);

    return () => clearInterval(interval);
  }, [auditId, isFinished]);

  const showSubmitView = isFinished && isEmailSet;

  const NonSubmitView = (
    <Container maxWidth="md">
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
            Your audit is complete. Enter your email below to view your results.
          </Typography>
        </>
      )}
      {!isEmailSet ? (
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

          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      disabled={!email}
                      onClick={() => appendEmail(email)}
                      sx={{
                        minWidth: 60,
                        width: 60,
                        height: 30,
                        borderRadius: 1.5,
                        bgcolor: "rgba(143,0,255,0.85)",
                        boxShadow: "0 8px 20px rgba(143,0,255,0.25)",
                        "&:hover": {
                          bgcolor: "rgba(143,0,255,1)",
                          boxShadow: "0 12px 30px rgba(143,0,255,0.35)",
                        },
                      }}
                    >
                      Submit
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      ) : (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Thank you! Your audit results will be ready shortly!
        </Typography>
      )}
      {/* </Box> */}
    </Container>
  );

  const SubmitView = (
    <Container maxWidth="md">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
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
            mb: 3,
          }}
        >
          Your audit is ready. Click below to view your results.
        </Typography>

        {/* panel like your input block */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "80vw",
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 600,
              mb: 1,
            }}
          >
            View your audit results
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            We’ll show platform grades, tracking signals, and recommended
            actions.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={auditResults}
            sx={{
              py: 1.25,
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              background:
                "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
              boxShadow: "0 18px 55px rgba(143,0,255,0.25)",
              "&:hover": {
                boxShadow: "0 22px 70px rgba(143,0,255,0.32)",
              },
            }}
          >
            View Audit Results
          </Button>
        </Box>
      </Box>
    </Container>
  );

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
      {showSubmitView ? SubmitView : NonSubmitView}
    </Box>
  );
}
