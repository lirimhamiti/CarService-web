import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession } from "../../auth/model/session";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

import {
  createService,
  getCarServices,
  type CreateServiceRequest,
  type ServiceDto,
} from "../servicesApi"; // <-- adjust if your path differs

export function CarServicesPageHistory() {
  const navigate = useNavigate();
  const { carId } = useParams<{ carId: string }>();

  const session = getSession();
  const garageId = session?.garageId ?? null;

  const [items, setItems] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Service dialog
  const [open, setOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD for type="date"
  });
  const [mileage, setMileage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!garageId) return false;
    if (!carId) return false;
    if (!serviceDate) return false;
    if (!mileage.trim()) return false;

    const n = Number(mileage);
    if (!Number.isFinite(n) || n < 0) return false;

    return !saving;
  }, [garageId, carId, serviceDate, mileage, saving]);

  const load = async () => {
    setError(null);
    setLoading(true);

    if (!garageId) {
      setItems([]);
      setLoading(false);
      setError("No garage logged in.");
      return;
    }
    if (!carId) {
      setItems([]);
      setLoading(false);
      setError("CarId missing from URL.");
      return;
    }

    try {
      const data = await getCarServices(garageId, carId);
      // optional: sort newest first
      const sorted = [...data].sort((a, b) =>
        (b.serviceDate ?? "").localeCompare(a.serviceDate ?? "")
      );
      setItems(sorted);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load service history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageId, carId]);

  const openDialog = () => {
    setSaveError(null);

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setServiceDate(`${yyyy}-${mm}-${dd}`);

    setMileage("");
    setNotes("");
    setOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setOpen(false);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaveError(null);

    if (!garageId) {
      setSaveError("You must login first.");
      return;
    }
    if (!carId) {
      setSaveError("CarId missing.");
      return;
    }

    const mileageNum = Number(mileage);
    if (!Number.isFinite(mileageNum) || mileageNum < 0) {
      setSaveError("Mileage must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    try {
      const body: CreateServiceRequest = {
        serviceDate: new Date(serviceDate).toISOString(),
        mileage: mileageNum,
        notes: notes.trim() ? notes.trim() : undefined,
      };

      await createService(garageId, carId, body);

      setOpen(false);
      await load(); // ✅ refresh list after create
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to add service record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Service History
          </Typography>

          {session && (
            <Typography variant="body2" color="text.secondary">
              Logged in as <b>{session.name}</b>
            </Typography>
          )}

          {carId && (
            <Typography variant="body2" color="text.secondary">
              CarId: <b>{carId}</b>
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<BuildOutlinedIcon />}
              onClick={openDialog}
              disabled={!garageId || !carId}
            >
              Add service
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/garage/cars")}
          >
            Back
          </Button>
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
              <Typography color="text.secondary">No service records yet.</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Date</b></TableCell>
                      <TableCell><b>Mileage</b></TableCell>
                      <TableCell><b>Notes</b></TableCell>
                      <TableCell><b>Created</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>
                          {s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>{s.mileage ?? "-"}</TableCell>
                        <TableCell sx={{ maxWidth: 520, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.notes || "-"}
                        </TableCell>
                        <TableCell>
                          {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* ✅ Add Service Dialog */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          Add Service Record
          <IconButton
            onClick={closeDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} component="form" onSubmit={submit}>
            <Typography variant="body2" color="text.secondary">
              CarId: <b>{carId ?? "-"}</b>
            </Typography>

            <Divider />

            {saveError && <Alert severity="error">{saveError}</Alert>}

            <TextField
              label="Service date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            <TextField
              label="Mileage (km)"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              fullWidth
              required
              inputMode="numeric"
            />

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            {/* hidden submit so Enter works */}
            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>

          <Tooltip title={!garageId ? "Login required" : ""}>
            <span>
              <Button
                variant="contained"
                onClick={() => void submit()}
                disabled={!canSave}
                startIcon={saving ? <CircularProgress size={18} /> : undefined}
              >
                {saving ? "Saving..." : "Save service"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
