import { useEffect, useMemo, useState } from "react";
import type { CarDto } from "../api/carsApi";
import { getGarageCars, createCar, getCarQrPng } from "../api/carsApi";
import { getSession } from "../../auth/model/session";
import { useNavigate } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import QrCode2Icon from "@mui/icons-material/QrCode2";

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
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

import {
  createService,
  type CreateServiceRequest,
} from "../../services/servicesApi"; 

export function MyCarsPage() {
  const navigate = useNavigate();

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

  const [openService, setOpenService] = useState(false);
  const [serviceCarId, setServiceCarId] = useState<string | null>(null);
  const [servicePlate, setServicePlate] = useState<string>("");
  const [serviceDate, setServiceDate] = useState<string>(() => {

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [mileage, setMileage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceDone, setServiceDone] = useState<string | null>(null);

  const canCreate = useMemo(() => {
    return !!garageId && plateNumber.trim().length > 0 && !saving;
  }, [garageId, plateNumber, saving]);

  const canCreateService = useMemo(() => {
    if (!garageId) return false;
    if (!serviceCarId) return false;
    if (!serviceDate) return false;
    if (!mileage.trim()) return false;
    if (Number.isNaN(Number(mileage))) return false;
    if (Number(mileage) < 0) return false;
    return !serviceSaving;
  }, [garageId, serviceCarId, serviceDate, mileage, serviceSaving]);

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

  const openServiceDialog = (carId: string, plate: string) => {
    setServiceError(null);
    setServiceDone(null);
    setServiceCarId(carId);
    setServicePlate(plate);

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setServiceDate(`${yyyy}-${mm}-${dd}`);

    setMileage("");
    setNotes("");
    setOpenService(true);
  };

  const closeServiceDialog = () => {
    if (serviceSaving) return;
    setOpenService(false);
  };

  const submitService = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setServiceError(null);
    setServiceDone(null);

    if (!garageId) {
      setServiceError("You must login first.");
      return;
    }
    if (!serviceCarId) {
      setServiceError("Car is missing.");
      return;
    }

    const mileageNum = Number(mileage);
    if (!Number.isFinite(mileageNum) || mileageNum < 0) {
      setServiceError("Mileage must be a valid non-negative number.");
      return;
    }

    setServiceSaving(true);
    try {
      const body: CreateServiceRequest = {
        serviceDate: new Date(serviceDate).toISOString(), 
        mileage: mileageNum,
        notes: notes.trim() ? notes.trim() : undefined,
      };

      await createService(garageId, serviceCarId, body);
      setServiceDone(`Service record added for ${servicePlate}.`);

      setOpenService(false);


    } catch (err: any) {
      setServiceError(err?.message ?? "Failed to add service record");
    } finally {
      setServiceSaving(false);
    }
  };


  // QR dialog
  const [openQr, setOpenQr] = useState(false);
  const [qrCarId, setQrCarId] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);

  const qrUrl = useMemo(() => (qrBlob ? URL.createObjectURL(qrBlob) : null), [qrBlob]);

  useEffect(() => {
    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
  }, [qrUrl]);

  const openQrDialog = async (carId: string) => {
    setQrError(null);
    setQrBlob(null);
    setQrCarId(carId);
    setOpenQr(true);

    setQrLoading(true);
    try {
      const blob = await getCarQrPng(carId);
      setQrBlob(blob);
    } catch (e: any) {
      setQrError(e?.message ?? "Failed to load QR");
    } finally {
      setQrLoading(false);
    }
  };

  const closeQrDialog = () => {
    if (qrLoading) return;
    setOpenQr(false);
  };

  const downloadQr = () => {
    if (!qrBlob || !qrCarId) return;

    const url = URL.createObjectURL(qrBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `car-${qrCarId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <CardContent>
            {loading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography>Loading...</Typography>
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">No cars yet.</Typography>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid", borderColor: "grey.200" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>Plate</b>
                      </TableCell>
                      <TableCell>
                        <b>VIN</b>
                      </TableCell>
                      <TableCell>
                        <b>Created</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Services</b>
                      </TableCell>
                      <TableCell align="right"><b>QR</b></TableCell>
                      <TableCell align="right">
                        <b>Actions</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {c.plateNumber}
                        </TableCell>
                        <TableCell>{c.vin || "-"}</TableCell>
                        <TableCell>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Check service history">
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                onClick={() => navigate(`/garage/cars/${c.id}/history`)}
                              >
                                History
                              </Button>

                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Show QR code">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => void openQrDialog(c.id)}
                                disabled={!garageId}
                              >
                                <QrCode2Icon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Add service record">
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<BuildOutlinedIcon />}
                                onClick={() =>
                                  openServiceDialog(c.id, c.plateNumber)
                                }
                                disabled={!garageId}
                              >
                                Add Service
                              </Button>
                            </span>
                          </Tooltip>
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

      <Dialog
        open={openService}
        onClose={closeServiceDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Add Service Record
          <IconButton
            onClick={closeServiceDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
            disabled={serviceSaving}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} component="form" onSubmit={submitService}>
            <Typography variant="body2" color="text.secondary">
              Car: <b>{servicePlate || "-"}</b>
            </Typography>

            <Divider />

            {serviceError && <Alert severity="error">{serviceError}</Alert>}
            {serviceDone && <Alert severity="success">{serviceDone}</Alert>}

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

            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeServiceDialog} disabled={serviceSaving}>
            Cancel
          </Button>

          <Tooltip title={!garageId ? "Login required" : ""}>
            <span>
              <Button
                variant="contained"
                onClick={() => void submitService()}
                disabled={!canCreateService}
                startIcon={
                  serviceSaving ? <CircularProgress size={18} /> : undefined
                }
              >
                {serviceSaving ? "Saving..." : "Save service"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <Dialog open={openQr} onClose={closeQrDialog} fullWidth maxWidth="xs">
  <DialogTitle sx={{ pr: 6 }}>
    QR Code
    <IconButton
      onClick={closeQrDialog}
      sx={{ position: "absolute", right: 8, top: 8 }}
      aria-label="close"
      disabled={qrLoading}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
    {qrLoading && <CircularProgress />}
    {!qrLoading && qrError && <Alert severity="error">{qrError}</Alert>}
    {!qrLoading && !qrError && qrUrl && (
      <img
        src={qrUrl}
        alt="Car QR"
        style={{ width: 260, height: 260 }}
      />
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={downloadQr} disabled={!qrBlob || qrLoading}>
      Download PNG
    </Button>
    <Button onClick={closeQrDialog} disabled={qrLoading}>
      Close
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}
