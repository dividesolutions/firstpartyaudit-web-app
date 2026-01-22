import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Grid,
  Chip,
  Button,
  Divider,
  LinearProgress,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router";
import customAxios from "../lib/customAxios";
import SnackbarAlert from "../components/SnackBarAlert";

type AuditStatus = "pending" | "in_progress" | "finished" | "failed";

interface PlatformRow {
  platform: string; // "Meta", "Google", "TikTok"
  score: number; // 0-100
  grade: string; // "A".."F"
  signal: "Strong" | "Weak";
  estimatedRevenueLoss: string; // "10–20%"
  ctaHref?: string; // optional link to your CTA
}

interface AuditResultResponse {
  id: string;
  url: string;
  status: AuditStatus;
  progress: number;
  created_at?: string;
  finished_at?: string | null;

  // these can come from your API result_json later
  overallScore?: number; // 0-100
  platforms?: PlatformRow[];
  recommendedActions?: string[];
  notes?: string[];
  returnOnTrackingPotential?: number; // 0-100
}

const gradeFromScore = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const labelFromScore = (score: number) => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Weak";
};

export default function AuditResults() {
  const { auditId } = useParams<{ auditId: string }>();

  const [data, setData] = useState<AuditResultResponse | null>(null);
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

      // If your backend returns result_json, map it here.
      // For now, we’ll accept the response as-is and provide safe defaults.
      const raw = res.data as AuditResultResponse;

      // TEMP fallback demo data (remove once your API provides it)
      const overallScore =
        raw.overallScore ??
        (raw.status === "finished" ? Math.floor(60 + Math.random() * 35) : 0);

      const platforms: PlatformRow[] = raw.platforms ?? [
        {
          platform: "Meta",
          score: 62,
          grade: "D",
          signal: "Weak",
          estimatedRevenueLoss: "15–30%",
          ctaHref: "/resolve/meta",
        },
        {
          platform: "Google",
          score: 64,
          grade: "D",
          signal: "Weak",
          estimatedRevenueLoss: "10–20%",
          ctaHref: "/resolve/google",
        },
        {
          platform: "TikTok",
          score: 61,
          grade: "D",
          signal: "Weak",
          estimatedRevenueLoss: "20–25%",
          ctaHref: "/resolve/tiktok",
        },
      ];

      const next: AuditResultResponse = {
        ...raw,
        overallScore,
        platforms,
        returnOnTrackingPotential: raw.returnOnTrackingPotential ?? 95,
        recommendedActions: raw.recommendedActions ?? [
          "Move key event signals to a first-party endpoint (server-side collection).",
          "Reduce third-party dependency by consolidating tag firing.",
          "Harden cookies (Secure, SameSite) and clean up redundant identifiers.",
        ],
        notes: raw.notes ?? [
          "Signal quality is limited by third-party cookie availability and browser restrictions.",
          "You can materially improve resilience by shifting to first-party tracking architecture.",
        ],
      };

      setData(next);
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
    // You can optionally poll if status isn’t finished yet
    // (e.g. if user lands here early)
  }, [auditId]);

  const overallScore = data?.overallScore ?? 0;
  const overallGrade = useMemo(
    () => gradeFromScore(overallScore),
    [overallScore],
  );

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
            {data?.url ? `Results for ${data.url}` : "Audit results"}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={data?.status ? `Status: ${data.status}` : "Status: —"}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            {data?.status !== "finished" && (
              <Chip
                label={`${data?.progress ?? 0}%`}
                size="small"
                sx={{
                  bgcolor: "rgba(143,0,255,0.18)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(143,0,255,0.25)",
                }}
              />
            )}
          </Stack>
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
        ) : data?.status !== "finished" ? (
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
                value={data?.progress ?? 0}
                variant="determinate"
              />
              <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                Progress: {data?.progress ?? 0}%. You can stay here and refresh,
                or head back to the scanner.
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
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    Return on Tracking Potential
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                    Estimated upside if you move key signals to a first-party
                    architecture and reduce third-party dependency.
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ fontWeight: 900, fontSize: "2rem" }}>
                      {data.returnOnTrackingPotential ?? 95}%
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={data.returnOnTrackingPotential ?? 95}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.08)",
                          "& .MuiLinearProgress-bar": {
                            background:
                              "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Platform grid */}
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
              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 800 }}>
                  Platform breakdown
                </Typography>

                <Grid container spacing={2}>
                  {(data.platforms ?? []).map((p) => (
                    <Grid size={{ xs: 12, md: 4 }} key={p.platform}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography sx={{ fontWeight: 800 }}>
                              {p.platform}
                            </Typography>
                            <Chip
                              size="small"
                              label={p.grade}
                              sx={{
                                bgcolor: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.85)",
                                border: "1px solid rgba(255,255,255,0.12)",
                              }}
                            />
                          </Stack>

                          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Score: {p.score}/100 • Signal: {p.signal}
                          </Typography>

                          <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                            Estimated revenue loss: {p.estimatedRevenueLoss}
                          </Typography>

                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              mt: 1,
                              textTransform: "none",
                              fontWeight: 800,
                              background:
                                "linear-gradient(135deg, rgba(143,0,255,1), rgba(90,200,250,0.9))",
                              boxShadow: "0 18px 55px rgba(143,0,255,0.18)",
                            }}
                            component={RouterLink}
                            to={p.ctaHref ?? "/"}
                          >
                            Resolve
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>

            {/* Recommended actions */}
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
                <Typography sx={{ fontWeight: 800 }}>
                  Recommended actions
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Based on observed cookie health and request patterns, these
                  are the highest impact next steps.
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                <Stack spacing={1}>
                  {(data.recommendedActions ?? []).map((a, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                        {a}
                      </Typography>
                    </Box>
                  ))}
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
