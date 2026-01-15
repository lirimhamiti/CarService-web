import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SearchIcon from "@mui/icons-material/Search";
import KeyIcon from "@mui/icons-material/Key";
import { useNavigate } from "react-router-dom";

import { ownerGetCarByVin } from "../../owners/api/ownerApi";

export function OwnerHomePage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"vin" | "qr" | null>(null);
  const [vin, setVin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => vin.trim().length >= 5 && !loading, [vin, loading]);

  const onVinSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await ownerGetCarByVin(vin.trim());

      navigate(`/owner/history/vin/${encodeURIComponent(result.vin)}`);
    } catch (e: any) {
      setError(e?.message ?? "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, mt: "-50px" }}>
      <Card sx={{ width: "100%", maxWidth: 520, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }} elevation={0}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={800}>
              Car History
            </Typography>
            <Typography color="text.secondary">
              Check your car service history by VIN or QR code.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                fullWidth
                variant={mode === "vin" ? "contained" : "outlined"}
                startIcon={<KeyIcon />}
                onClick={() => setMode("vin")}
              >
                Check by VIN
              </Button>

              <Button
                fullWidth
                variant={mode === "qr" ? "contained" : "outlined"}
                startIcon={<QrCodeScannerIcon />}
                onClick={() => {
                  setMode("qr");
                  navigate("/owner/scan");
                }}
              >
                Check by QR
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {mode === "vin" && (
              <Stack spacing={1.5}>
                <TextField
                  label="Enter VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  disabled={!canSearch}
                  onClick={() => void onVinSearch()}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              Tip: QR scanning works best on mobile (HTTPS required for camera access).
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
