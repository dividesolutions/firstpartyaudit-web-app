import { Container, Typography, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function About() {
    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom>
                About
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" component={RouterLink} to="/">
                    Back Home
                </Button>
            </Stack>
        </Container>
    );
}
