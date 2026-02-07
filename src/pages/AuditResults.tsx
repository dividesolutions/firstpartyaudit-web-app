import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import customAxios from "../lib/customAxios";
import type { SignalLevel } from "../components/SignalBars";
import { SignalBars } from "../components/SignalBars";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import WorkIcon from "@mui/icons-material/Work";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import SnackbarAlert from "../components/SnackBarAlert";

// ============================
// Types
// ============================
type AuditStatus = "queued" | "running" | "finished" | "failed";

interface AuditResultResponse {
  id: string;
  url: string;
  email: string;
  status: AuditStatus;
  progress: number;
  result: ResultJson | null;
  error: string | null;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
}

interface ResultJson {
  url: string;
  letterGrade: string;
  overallScore: number;
  recommendedActions: string;

  cookies: {
    tracking: Array<{
      name: string;
      provider: string;
      category: string;
    }>;
  };

  platforms: Array<{
    platform: string;
    score: number;
    present: boolean;
    resolveCTA?: string;
    debug: {
      cookies: string[];
      fpCookies?: string[];
      tpCookies?: string[];
    };
  }>;
}

// ============================
// Helpers
// ============================
function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function labelFromScore(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 85) return "Very Good";
  if (score >= 80) return "Good";
  if (score >= 70) return "Okay";
  if (score >= 60) return "Weak";
  return "Poor";
}

function signalFromScore(score: number): SignalLevel {
  if (score >= 85) return "strong";
  if (score >= 70) return "medium";
  if (score >= 50) return "weak";
  return "bad";
}

const platformMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  Meta: {
    label: "Meta",
    icon: <FacebookIcon sx={{ width: 32, height: 32 }} />,
  },
  "Google Analytics": {
    label: "Google Analytics",
    icon: <GoogleIcon sx={{ width: 32, height: 32 }} />,
  },
  "Google Ads": {
    label: "Google Ads",
    icon: <GoogleIcon sx={{ width: 32, height: 32 }} />,
  },
  TikTok: {
    label: "TikTok",
    icon: <MusicNoteIcon sx={{ width: 32, height: 32 }} />,
  },
  LinkedIn: {
    label: "LinkedIn",
    icon: <WorkIcon sx={{ width: 32, height: 32 }} />,
  },
};

const getPlatformMeta = (platform: string) =>
  platformMeta[platform] ?? {
    label: platform,
    icon: <HelpOutlineIcon />,
  };

// ============================
// Page
// ============================
export default function AuditResults() {
  const { auditId } = useParams<{ auditId: string }>();

  const [auditData, setAuditData] = useState<AuditResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchAudit = async () => {
    if (!auditId) return;

    try {
      setLoading(true);
      const res = await customAxios.get(`/audits/${auditId}`);
      const raw = res.data as AuditResultResponse;

      setAuditData(raw);
    } catch (e) {
      console.error(e);
      setSnackbarMessage("Failed to load audit results. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [auditId]);

  const result = auditData?.result;

  const overallScore = result?.overallScore ?? 0;
  const overallGrade = useMemo(() => {
    // Prefer backend grade if present, otherwise compute
    return gradeFromScore(overallScore);
  }, [overallScore]);

  const presentPlatforms = useMemo(() => {
    return (result?.platforms ?? []).filter((p) => p.present);
  }, [result?.platforms]);

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
            radial-gradient(900px 600px at 20% 25%, rgba(143,0,255,0.24), transparent 60%),
            radial-gradient(700px 500px at 80% 65%, rgba(90,200,250,0.12), transparent 55%)
          `,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          py: { xs: 6, md: 10 },
        }}
      >
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            First Party Audit Results
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              lineHeight: 1.05,
              fontSize: { xs: "2rem", md: "2.4rem" },
            }}
          >
            {auditData?.url ? `Results for ${auditData.url}` : "Audit results"}
          </Typography>
        </Stack>

        {/* Loading / Not ready */}
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 700 }}>
                Loading audit results…
              </Typography>
              <LinearProgress />
              <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                Pulling platform scores, signal status, and recommended actions.
              </Typography>
            </Stack>
          </Paper>
        ) : auditData?.status !== "finished" || !result ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                This audit isn’t finished yet
              </Typography>

              <LinearProgress
                value={auditData?.progress ?? 0}
                variant="determinate"
              />

              <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                Progress: {auditData?.progress ?? 0}%. You can stay here and
                refresh, or head back to the scanner.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={fetchAudit}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Back to home
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <>
            {/* Top summary */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.75)",
                      mb: 1,
                    }}
                  >
                    Overall grade
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "3.2rem",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {overallGrade}
                  </Typography>

                  <Typography sx={{ color: "rgba(255,255,255,0.65)", mt: 1 }}>
                    Score: {overallScore}/100 • {labelFromScore(overallScore)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    height: "100%",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    Recommended actions
                  </Typography>

                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {result.recommendedActions}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Platform breakdown */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                mb: 2,
              }}
            >
              <Stack spacing={2} display={"flex"}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    Platform breakdown
                  </Typography>

                  <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                    Only platforms detected as present are shown. Expand a card
                    to see cookies.
                  </Typography>
                </Stack>

                {presentPlatforms.length === 0 ? (
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    No platforms detected.
                  </Typography>
                ) : (
                  <Box sx={{ mx: "auto", width: "100%" }}>
                    <Grid container spacing={1} justifyContent="center">
                      {presentPlatforms.map((p) => {
                        const meta = getPlatformMeta(p.platform);
                        const grade = gradeFromScore(p.score);

                        return (
                          <Grid size={{ xs: 12 }} key={p.platform}>
                            <Accordion
                              disableGutters
                              elevation={0}
                              sx={{
                                bgcolor: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: 2,
                                overflow: "hidden",
                                "&:before": { display: "none" },
                                minHeight: "75px",
                                mx: "auto",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon
                                    sx={{ color: "rgba(255,255,255,0.75)" }}
                                  />
                                }
                                sx={{
                                  "& .MuiAccordionSummary-content": {
                                    my: 1,
                                  },
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                  sx={{ width: "100%" }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      color: "rgba(255,255,255,0.85)",
                                      width: 32,
                                      height: 32,
                                    }}
                                  >
                                    {meta.icon}
                                  </Box>

                                  <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 900 }}>
                                      {meta.label}
                                    </Typography>
                                    {/* <Typography
                                    sx={{
                                      color: "rgba(255,255,255,0.7)",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    Score: {p.score}/100 • Signal: Strong
                                  </Typography> */}
                                  </Box>

                                  <SignalBars
                                    level={signalFromScore(p.score)}
                                  />
                                </Stack>
                              </AccordionSummary>

                              <AccordionDetails
                                sx={{
                                  borderTop: "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <Stack spacing={1}>
                                  <Typography sx={{ fontWeight: 800 }}>
                                    Cookies detected
                                  </Typography>

                                  {p.debug.cookies.length === 0 ? (
                                    <Typography
                                      sx={{ color: "rgba(255,255,255,0.65)" }}
                                    >
                                      No cookies detected for this platform.
                                    </Typography>
                                  ) : (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      flexWrap="wrap"
                                      useFlexGap
                                    >
                                      {p.debug.cookies.map((c) => (
                                        <Chip
                                          key={`${p.platform}:${c}`}
                                          size="small"
                                          label={c}
                                          sx={{
                                            bgcolor: "rgba(255,255,255,0.06)",
                                            color: "rgba(255,255,255,0.85)",
                                            border:
                                              "1px solid rgba(255,255,255,0.10)",
                                          }}
                                        />
                                      ))}
                                    </Stack>
                                  )}

                                  {p.resolveCTA ? (
                                    <>
                                      <Divider
                                        sx={{
                                          my: 1.5,
                                          borderColor: "rgba(255,255,255,0.1)",
                                        }}
                                      />
                                      <Typography
                                        sx={{ color: "rgba(255,255,255,0.7)" }}
                                      >
                                        {p.resolveCTA}
                                      </Typography>
                                    </>
                                  ) : null}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Back / Refresh */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                  Last updated:{" "}
                  {auditData?.finishedAt
                    ? new Date(auditData.finishedAt).toLocaleString()
                    : "—"}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Back to home
                  </Button>

                  <Button
                    variant="contained"
                    onClick={fetchAudit}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
                      boxShadow: "0 18px 55px rgba(143,0,255,0.18)",
                    }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </>
        )}
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
