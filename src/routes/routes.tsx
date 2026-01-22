import { Routes, Route } from "react-router";
import { Suspense, lazy } from "react";
import CssSpinner from "../components/CssSpinner";

const HomeRoute = lazy(() => import("../pages/Home"));
const AuditScanning = lazy(() => import("../pages/AuditScanning"));
const AuditResults = lazy(() => import("../pages/AuditResults"));

function AppRoutes() {
  return (
    <Suspense fallback={<CssSpinner />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/audit/:auditId" element={<AuditScanning />} />
        <Route path="/audit/:auditId/results" element={<AuditResults />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
