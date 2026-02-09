import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";
import { useTranslation } from "react-i18next";

export function OwnerScanQrPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      (result) => {
        const token = result.data?.trim();
        if (!token) return;

        navigate(`/owner/history/token/${encodeURIComponent(token)}`, { replace: true });
      },
      { returnDetailedScanResult: true }
    );

    scannerRef.current = scanner;

    scanner.start().catch(() => {
      setError(t("owner.scan.errors.cameraDenied"));
    });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [navigate, t]);

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
      <Card
        sx={{ width: "100%", maxWidth: 520, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
        elevation={0}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={800}>
                {t("owner.scan.title")}
              </Typography>

              <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/owner")}>
                {t("common.back")}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "grey.300" }}>
              <video ref={videoRef} style={{ width: "100%", display: "block" }} />
            </Box>

            {/* <Typography variant="caption" color="text.secondary">
              {t("owner.scan.tip")}
            </Typography> */}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
