import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession } from "../../auth/model/session";
import { useTranslation } from "react-i18next";

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
} from "../servicesApi";

export function CarServicesPageHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { carId } = useParams<{ carId: string }>();

  const session = getSession();
  const garageId = session?.garageId ?? null;

  const [items, setItems] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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
      setError(t("carServices.noGarageLoggedIn"));
      return;
    }
    if (!carId) {
      setItems([]);
      setLoading(false);
      setError(t("carServices.carIdMissingFromUrl"));
      return;
    }

    try {
      const data = await getCarServices(garageId, carId);
      const sorted = [...data].sort((a, b) =>
        (b.serviceDate ?? "").localeCompare(a.serviceDate ?? "")
      );
      setItems(sorted);
    } catch (e: any) {
      setError(e?.message ?? t("carServices.failedToLoadHistory"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
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
      setSaveError(t("carServices.mustLoginFirst"));
      return;
    }
    if (!carId) {
      setSaveError(t("carServices.carIdMissing"));
      return;
    }

    const mileageNum = Number(mileage);
    if (!Number.isFinite(mileageNum) || mileageNum < 0) {
      setSaveError(t("carServices.mileageInvalid"));
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
      await load();
    } catch (err: any) {
      setSaveError(err?.message ?? t("carServices.failedToAddService"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }} style={{ paddingTop: '7vh' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("carServices.title")}
          </Typography>

          {session && (
            <Typography variant="body2" color="text.secondary">
              {t("carServices.loggedInAs")} <b>{session.name}</b>
            </Typography>
          )}

        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              variant="contained"
              startIcon={<BuildOutlinedIcon />}
              onClick={openDialog}
              disabled={!garageId || !carId}
              size="small"
              fullWidth
              sx={{ minWidth: { sm: 160 } }}
            >
              {t("carServices.addService")}
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={load}
              disabled={loading}
              size="small"
              fullWidth
              sx={{ minWidth: { sm: 130 } }}
            >
              {t("common.refresh")}
            </Button>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/garage/cars")}
            size="small"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 120 },
              alignSelf: { xs: "stretch", sm: "center" },
            }}
          >
            {t("common.back")}
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
              <Typography color="text.secondary">{t("carServices.empty")}</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>{t("carServices.table.date")}</b></TableCell>
                      <TableCell><b>{t("carServices.table.mileage")}</b></TableCell>
                      <TableCell><b>{t("carServices.table.notes")}</b></TableCell>
                      <TableCell><b>{t("carServices.table.created")}</b></TableCell>
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

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          {t("carServices.dialog.title")}
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
            {/* <Typography variant="body2" color="text.secondary">
              {t("carServices.carIdLabel")} <b>{carId ?? "-"}</b>
            </Typography> */}

            <Divider />

            {saveError && <Alert severity="error">{saveError}</Alert>}

            <TextField
              label={t("carServices.dialog.serviceDate")}
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            <TextField
              label={t("carServices.dialog.mileage")}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              fullWidth
              required
              inputMode="numeric"
            />

            <TextField
              label={t("carServices.dialog.notes")}
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
          <Button onClick={closeDialog} disabled={saving}>
            {t("common.cancel")}
          </Button>

          <Tooltip title={!garageId ? t("common.loginRequired") : ""}>
            <span>
              <Button
                variant="contained"
                onClick={() => void submit()}
                disabled={!canSave}
                startIcon={saving ? <CircularProgress size={18} /> : undefined}
              >
                {saving ? t("common.saving") : t("carServices.dialog.saveService")}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
