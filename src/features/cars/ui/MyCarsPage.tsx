import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

import { createService, type CreateServiceRequest } from "../../services/servicesApi";
import TablePagination from "@mui/material/TablePagination";

export function MyCarsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const session = getSession();
  const garageId = session?.garageId ?? null;

  const [items, setItems] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const canCreate = useMemo(() => {
    const v = vin.trim();
    return !!garageId && plateNumber.trim().length > 0 && v.length === 17 && !saving;
  }, [garageId, plateNumber, vin, saving]);

  const canCreateService = useMemo(() => {
    if (!garageId) return false;
    if (!serviceCarId) return false;
    if (!serviceDate) return false;
    if (!mileage.trim()) return false;
    if (Number.isNaN(Number(mileage))) return false;
    if (Number(mileage) < 0) return false;
    return !serviceSaving;
  }, [garageId, serviceCarId, serviceDate, mileage, serviceSaving]);

  useEffect(() => {
    setPage(0);
  }, [garageId])

  const load = async () => {
    setError(null);
    setLoading(true);

    if (!garageId) {
      setItems([]);
      setLoading(false);
      setError(t("garageCars.noGarageLoggedIn"));
      return;
    }

    try {
      const cars = await getGarageCars(garageId);
      setItems(cars);
      setPage(0);
    } catch (e: any) {
      setError(e?.message ?? t("garageCars.failedToLoadCars"));
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

    if (!vin.trim()) {
      setCreateError(t("garageCars.vinRequired"));
      return;
    }
    if (vin.trim().length !== 17) {
      setCreateError(t("garageCars.vinMustBe17"));
      return;
    }
    if (!garageId) {
      setCreateError(t("common.loginRequired"));
      return;
    }
    if (!plateNumber.trim()) {
      setCreateError(t("garageCars.plateRequired"));
      return;
    }

    setSaving(true);
    try {
      await createCar(garageId, {
        plateNumber: plateNumber.trim(),
        vin: vin.trim().toUpperCase(),
      });

      setOpen(false);
      await load();
    } catch (err: any) {
      setCreateError(err?.message ?? t("garageCars.failedToCreateCar"));
    } finally {
      setSaving(false);
    }
  };

  const openServiceDialog = (carId: string, plate: string) => {
    setServiceError(null);
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

    if (!garageId) {
      setServiceError(t("common.loginRequired"));
      return;
    }
    if (!serviceCarId) {
      setServiceError(t("garageCars.carMissing"));
      return;
    }

    const mileageNum = Number(mileage);
    if (!Number.isFinite(mileageNum) || mileageNum < 0) {
      setServiceError(t("garageCars.mileageInvalid"));
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
      setOpenService(false);
    } catch (err: any) {
      setServiceError(err?.message ?? t("garageCars.failedToAddService"));
    } finally {
      setServiceSaving(false);
    }
  };

  const [openQr, setOpenQr] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrCarId, setQrCarId] = useState<string | null>(null);
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
      setQrError(e?.message ?? t("garageCars.failedToLoadQr"));
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

  const pagedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, page, rowsPerPage]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }} style={{ paddingTop: '7vh' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("garageCars.title")}
          </Typography>

          {session && (
            <Typography variant="body2" color="text.secondary">
              {t("garageCars.loggedInAs", { name: session.name })}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog} disabled={!garageId}>
            {t("garageCars.addCar")}
          </Button>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            {t("common.refresh")}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
          <CardContent>
            {loading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography>{t("common.loading")}</Typography>
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">{t("garageCars.noCarsYet")}</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>{t("garageCars.columns.plate")}</b></TableCell>
                      <TableCell><b>{t("garageCars.columns.vin")}</b></TableCell>
                      <TableCell><b>{t("garageCars.columns.created")}</b></TableCell>
                      <TableCell align="right"><b>{t("garageCars.columns.services")}</b></TableCell>
                      <TableCell align="right"><b>{t("garageCars.columns.qr")}</b></TableCell>
                      <TableCell align="right"><b>{t("garageCars.columns.actions")}</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pagedItems.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{c.plateNumber}</TableCell>
                        <TableCell>{c.vin || "-"}</TableCell>
                        <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</TableCell>

                        <TableCell align="right">
                          <Tooltip title={t("garageCars.tooltips.history")}>
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                onClick={() => navigate(`/garage/cars/${c.id}/history`)}
                              >
                                {t("garageCars.history")}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title={t("garageCars.tooltips.showQr")}>
                            <span>
                              <IconButton size="small" onClick={() => void openQrDialog(c.id)} disabled={!garageId}>
                                <QrCode2Icon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title={t("garageCars.tooltips.addService")}>
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<BuildOutlinedIcon />}
                                onClick={() => openServiceDialog(c.id, c.plateNumber)}
                                disabled={!garageId}
                              >
                                {t("garageCars.addService")}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  count={items.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage={t("common.rowsPerPage") ?? "Rows per page"}
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                />
              </TableContainer>

            )}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          {t("garageCars.addCarTitle")}
          <IconButton onClick={closeDialog} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="close" disabled={saving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} component="form" onSubmit={submitCreate}>
            {createError && <Alert severity="error">{createError}</Alert>}

            <TextField
              label={t("garageCars.plateLabel")}
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label={t("garageCars.vinLabel")}
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              required
              fullWidth
              inputProps={{ maxLength: 17 }}
              helperText={t("garageCars.vinHelper")}
            />

            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            {t("common.cancel")}
          </Button>

          <Button
            variant="contained"
            onClick={() => void submitCreate()}
            disabled={!canCreate}
            startIcon={saving ? <CircularProgress size={18} /> : undefined}
          >
            {saving ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openService} onClose={closeServiceDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          {t("garageCars.addServiceTitle")}
          <IconButton onClick={closeServiceDialog} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="close" disabled={serviceSaving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} component="form" onSubmit={submitService}>
            <Typography variant="body2" color="text.secondary">
              {t("garageCars.carLabel")} <b>{servicePlate || "-"}</b>
            </Typography>

            <Divider />

            {serviceError && <Alert severity="error">{serviceError}</Alert>}

            <TextField
              label={t("garageCars.serviceDateLabel")}
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            <TextField
              label={t("garageCars.mileageLabel")}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              fullWidth
              required
              inputMode="numeric"
            />

            <TextField
              label={t("garageCars.notesLabel")}
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
            {t("common.cancel")}
          </Button>

          <Button
            variant="contained"
            onClick={() => void submitService()}
            disabled={!canCreateService}
            startIcon={serviceSaving ? <CircularProgress size={18} /> : undefined}
          >
            {serviceSaving ? t("common.saving") : t("garageCars.saveService")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openQr} onClose={closeQrDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pr: 6 }}>
          {t("garageCars.qrTitle")}
          <IconButton onClick={closeQrDialog} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="close" disabled={qrLoading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
          {qrLoading && <CircularProgress />}
          {!qrLoading && qrError && <Alert severity="error">{qrError}</Alert>}
          {!qrLoading && !qrError && qrUrl && (
            <img src={qrUrl} alt={t("garageCars.qrAlt")} style={{ width: 260, height: 260 }} />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={downloadQr} disabled={!qrBlob || qrLoading}>
            {t("garageCars.downloadPng")}
          </Button>
          <Button onClick={closeQrDialog} disabled={qrLoading}>
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
