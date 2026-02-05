import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { loginGarage } from "../api/authApi";
import { saveSession } from "../model/session";

export function GarageLoginPage() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit = username.trim() && password && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    setSaving(true);

    try {
      const result = await loginGarage({ username, password });
      saveSession(result);
      navigate("/garage/cars", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "";

      setError(msg || t("auth.loginFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 0 },
        overflowX: "hidden",
        overflowY: { xs: "auto", md: "hidden" },
        boxSizing: "border-box",
        marginTop: "-50px",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          mx: "auto",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                CarService
              </Typography>

              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
                {t("auth.garageLoginTitle")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("auth.garageLoginSubtitle")}
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {done && <Alert severity="success">{done}</Alert>}

            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                <TextField
                  label={t("auth.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  autoComplete="username"
                />

                <TextField
                  label={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  fullWidth
                  required
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={t("auth.togglePasswordVisibility")}
                          onClick={() => setShowPw((s) => !s)}
                          edge="end"
                        >
                          {showPw ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!canSubmit}
                  startIcon={saving ? <CircularProgress size={18} /> : undefined}
                >
                  {saving ? t("auth.loggingIn") : t("auth.login")}
                </Button>

                <Typography variant="caption" color="text.secondary">
                  {t("auth.waitForApprovalHint")}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
