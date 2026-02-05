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
import { useTranslation } from "react-i18next";

import { ownerGetCarByVin } from "../../owners/api/ownerApi";

export function OwnerHomePage() {
  const { t } = useTranslation();
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
      setError(e?.message ?? t("owner.home.errors.searchFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        mt: "-50px",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
        elevation={0}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={800}>
              {t("owner.home.title")}
            </Typography>

            <Typography color="text.secondary">
              {t("owner.home.subtitle")}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                fullWidth
                variant={mode === "vin" ? "contained" : "outlined"}
                startIcon={<KeyIcon />}
                onClick={() => setMode("vin")}
              >
                {t("owner.home.actions.byVin")}
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
                {t("owner.home.actions.byQr")}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {mode === "vin" && (
              <Stack spacing={1.5}>
                <TextField
                  label={t("owner.home.fields.vin")}
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
                  {loading ? t("common.searching") : t("common.search")}
                </Button>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              {t("owner.home.tip")}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
