import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
} from "@mui/material";
import { useState } from "react";
import customAxios from "../lib/customAxios";

export default function Home() {
    const [url, setUrl] = useState("");

    const runAudit = async () => {
        console.log("Running audit for URL:", url);

        const payload = {
            url: url,
            email: null,
        };

        try {
            const response = await customAxios.post("/audits", payload);
        } catch (error) {
            console.error("Error running audit:", error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    py: 4,
                    textAlign: "center",
                }}
            >
                <Typography variant="h3" fontWeight={600}>
                    First Party
                </Typography>
            </Box>

            {/* Main Content */}
            <Container
                maxWidth="sm"
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: "100%",
                        p: 4,
                    }}
                >
                    <Stack spacing={3}>
                        <Typography variant="h6" textAlign="center">
                            Enter a website URL
                        </Typography>

                        <TextField
                            fullWidth
                            label="Website URL"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={runAudit}
                        >
                            Run Audit
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
