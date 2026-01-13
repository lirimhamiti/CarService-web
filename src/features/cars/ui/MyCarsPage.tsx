import { useEffect, useMemo, useState } from "react";
import type { CarDto } from "../api/carsApi"; 
import { getGarageCars, createCar } from "../api/carsApi";
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
  IconButton,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

export function MyCarsPage() {
  const session = getSession();
  const garageId = session?.garageId ?? null;

  const [items, setItems] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vin, setVin] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreate = useMemo(() => {
    return !!garageId && plateNumber.trim().length > 0 && !saving;
  }, [garageId, plateNumber, saving]);

  const load = async () => {
    setError(null);
    setLoading(true);

    if (!garageId) {
      setItems([]);
      setLoading(false);
      setError("No garage logged in.");
      return;
    }

    try {
      const cars = await getGarageCars(garageId);
      setItems(cars);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [garageId]);

  const openDialog = () => {
    setCreateError(null);
    setPlateNumber("");
    setVin("");
    setOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setOpen(false);
  };

  const submitCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setCreateError(null);

    if (!garageId) {
      setCreateError("You must login first.");
      return;
    }
    if (!plateNumber.trim()) {
      setCreateError("Plate number is required.");
      return;
    }

    setSaving(true);
    try {
      await createCar(garageId, {
        plateNumber: plateNumber.trim(),
        vin: vin.trim() ? vin.trim() : undefined,
      });

      setOpen(false);
      await load();
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create car");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            My Cars
          </Typography>
          {session && (
            <Typography variant="body2" color="text.secondary">
              Logged in as <b>{session.name}</b>
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openDialog}
            disabled={!garageId}
          >
            Add car
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

        {error && <Alert severity="error">{error}</Alert>}

        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
          <CardContent>
            {loading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography>Loading...</Typography>
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">No cars yet.</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Plate</b></TableCell>
                      <TableCell><b>VIN</b></TableCell>
                      <TableCell><b>Created</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{c.plateNumber}</TableCell>
                        <TableCell>{c.vin || "-"}</TableCell>
                        <TableCell>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
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

      {/* ✅ Add Car Dialog */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          Add Car
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
          <Stack spacing={2} component="form" onSubmit={submitCreate}>
            {createError && <Alert severity="error">{createError}</Alert>}

            <TextField
              label="Plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="VIN (optional)"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              fullWidth
            />

            {/* Hidden submit button so Enter works */}
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
                onClick={() => void submitCreate()}
                disabled={!canCreate}
                startIcon={saving ? <CircularProgress size={18} /> : undefined}
              >
                {saving ? "Creating..." : "Create"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
