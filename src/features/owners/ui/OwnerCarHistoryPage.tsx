import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate, useParams } from "react-router-dom";
import {
  ownerGetCarByToken,
  ownerGetCarByVin,
  ownerGetServicesByToken,
  ownerGetServicesByVin,
  type OwnerServiceRecordDto,
  type OwnerCarDto,
} from "../api/ownerApi";

function extractToken(input: string) {
  const s = decodeURIComponent(input ?? "").trim();

  try {
    const u = new URL(s);
    const t = u.searchParams.get("token");
    if (t) return t.trim();
  } catch {
  }

  const idx = s.toLowerCase().indexOf("token=");
  if (idx >= 0) {
    const after = s.substring(idx + "token=".length);
    const token = after.split("&")[0].trim();
    return token;
  }

  return s;
}


export function OwnerCarHistoryPage() {
  const navigate = useNavigate();
  const { kind, value } = useParams<{ kind: "vin" | "token"; value: string }>();

  const [car, setCar] = useState<OwnerCarDto | null>(null);
  const [items, setItems] = useState<OwnerServiceRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const titleValue = useMemo(() => {
  if (!value) return "";
  return kind === "token" ? extractToken(value) : decodeURIComponent(value);
}, [kind, value]);

  const load = async () => {
    if (!kind || !value) return;

    setError(null);
    setLoading(true);

    try {
      if (kind === "vin") {
        const vin = decodeURIComponent(value);
        const [carDto, services] = await Promise.all([
          ownerGetCarByVin(vin),
          ownerGetServicesByVin(vin),
        ]);
        setCar(carDto);
        setItems(services);
      } else {
        const token = extractToken(value);
        const [carDto, services] = await Promise.all([
          ownerGetCarByToken(token),
          ownerGetServicesByToken(token),
        ]);
        setCar(carDto);
        setItems(services);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [kind, value]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Service History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {kind === "vin" ? "VIN" : "Token"}: <b>{titleValue}</b>
            </Typography>
            {car && (
              <Typography variant="body2" color="text.secondary">
                Plate: <b>{car.plateNumber}</b>
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/owner")}>
              Back
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
          <CardContent>
            {loading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography>Loading...</Typography>
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">No service records found.</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Garage</b></TableCell>
                      <TableCell><b>Date</b></TableCell>
                      <TableCell><b>Mileage</b></TableCell>
                      <TableCell><b>Notes</b></TableCell>
                      <TableCell><b>Created</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.garageName} ({s.garageCity})</TableCell>
                        <TableCell>{s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{s.mileage ?? "-"}</TableCell>
                        <TableCell>{s.notes || "-"}</TableCell>
                        <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
