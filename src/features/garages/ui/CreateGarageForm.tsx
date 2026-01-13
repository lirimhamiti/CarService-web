import { useMemo, useState } from "react";
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
import { registerGarage } from "../api/garagesApi";

export function CreateGarageForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const pwMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  const canSubmit =
    name.trim() &&
    city.trim() &&
    email.trim() &&
    username.trim() &&
    password &&
    confirmPassword &&
    !pwMismatch &&
    !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const dto = await registerGarage({ name, city, email, username, password });
      setDone(`Registered. Status: ${dto.status}. Wait for admin approval.`);

      setName("");
      setCity("");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to register garage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
    sx={{
      height: "100%",          
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
       overflowX: "hidden",
    overflowY: { xs: "auto", md: "hidden" },    
      px: 2,
      py: 2,                  
      bgcolor: "background.default",
    }}
  >
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 520,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                CarService
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
                Garage Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                After registration, your account stays pending until admin approval.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {done && <Alert severity="success">{done}</Alert>}

            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Garage name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    fullWidth
                    required
                  />
                </Stack>

                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  fullWidth
                  required
                />

                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPw((s) => !s)} edge="end">
                            {showPw ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showPw2 ? "text" : "password"}
                    fullWidth
                    required
                    error={pwMismatch}
                    helperText={pwMismatch ? "Passwords do not match" : " "}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPw2((s) => !s)} edge="end">
                            {showPw2 ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!canSubmit}
                  startIcon={saving ? <CircularProgress size={18} /> : undefined}
                >
                  {saving ? "Registering..." : "Register"}
                </Button>

              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
