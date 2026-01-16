import { Routes, Route } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import Home from "./pages/Home";
import About from "./pages/About";

function NotFound() {
    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h4">404 - Page Not Found</Typography>
        </Container>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
