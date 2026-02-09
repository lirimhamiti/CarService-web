import { useEffect, useMemo, useState } from "react";
import type { GarageDto } from "../../garages/model/types";
import { approveGarage, rejectGarage, getGarages } from "../api/adminApi";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useTranslation } from "react-i18next";
import TablePagination from "@mui/material/TablePagination";


type ActionType = "approve" | "reject";
type FilterStatus = "pending" | "approved" | "rejected" | "all";

function normalizeStatus(raw: any): "pending" | "approved" | "rejected" | "unknown" {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("pending")) return "pending";
  if (s.includes("approved") || s.includes("accept")) return "approved";
  if (s.includes("rejected") || s.includes("declined") || s.includes("reject")) return "rejected";
  return "unknown";
}

export function PendingGaragesPage() {
  const { t } = useTranslation("common");

  const [items, setItems] = useState<GarageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: ActionType | null;
    garage: GarageDto | null;
  }>({ open: false, action: null, garage: null });

  const statusChipProps = (status: "pending" | "approved" | "rejected" | "unknown") => {
    if (status === "pending") return { label: t("status.pending"), color: "warning" as const };
    if (status === "approved") return { label: t("status.approved"), color: "success" as const };
    if (status === "rejected") return { label: t("status.rejected"), color: "error" as const };
    return { label: t("status.unknown"), color: "default" as const };
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [filter, items.length]);


  const load = async (status: FilterStatus = filter) => {
    setLoading(true);
    try {
      const data = await getGarages(status);
      setItems(data);
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: e?.message ?? t("admin.garages.loadFail"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(filter);
  }, [filter]);

  const openConfirm = (action: ActionType, garage: GarageDto) => {
    setConfirm({ open: true, action, garage });
  };

  const closeConfirm = () => {
    setConfirm({ open: false, action: null, garage: null });
  };

  const runAction = async () => {
    if (!confirm.action || !confirm.garage) return;

    const { action, garage } = confirm;
    closeConfirm();

    try {
      setLoading(true);

      if (action === "approve") await approveGarage(garage.id);
      else await rejectGarage(garage.id);

      setSnack({
        open: true,
        severity: "success",
        message:
          action === "approve"
            ? t("admin.garages.approvedSnack", { name: garage.name })
            : t("admin.garages.rejectedSnack", { name: garage.name }),
      });

      await load(filter);
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: e?.message ?? t("common.actionFailed"),
      });
      setLoading(false);
    }
  };

  const rows = useMemo(() => items, [items]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);


  const confirmTitle =
    confirm.action === "approve" ? t("admin.garages.confirmApproveTitle") : t("admin.garages.confirmRejectTitle");

  const confirmActionText =
    confirm.action === "approve" ? t("common.approve").toLowerCase() : t("common.reject").toLowerCase();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("admin.garages.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("admin.garages.subtitle")}
          </Typography>
        </Box>

        <Tooltip title={t("common.refresh")}>
          <span>
            <IconButton onClick={() => void load(filter)} disabled={loading} aria-label="refresh">
              <RefreshOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="pending" label={t("admin.garages.tabPending")} />
        <Tab value="approved" label={t("admin.garages.tabApproved")} />
        <Tab value="rejected" label={t("admin.garages.tabRejected")} />
        <Tab value="all" label={t("admin.garages.tabAll")} />
      </Tabs>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <TableContainer sx={{ maxHeight: "calc(100dvh - 260px)" }}>
          <Table stickyHeader aria-label="garages table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>{t("admin.garages.table.garage")}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t("admin.garages.table.city")}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t("admin.garages.table.email")}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t("admin.garages.table.username")}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t("admin.garages.table.status")}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, width: 220 }}>
                  {t("common.actions")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography fontWeight={700}>{t("admin.garages.emptyTitle")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("admin.garages.emptySubtitle")}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((g) => {
                  const status = normalizeStatus((g as any).status);
                  const chip = statusChipProps(status);

                  return (
                    <TableRow key={g.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{g.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {g.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{g.city}</TableCell>
                      <TableCell>{g.email}</TableCell>
                      <TableCell>{g.username}</TableCell>
                      <TableCell>
                        <Chip label={chip.label} size="small" color={chip.color} />
                      </TableCell>

                      <TableCell align="right">
                        {status === "pending" ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleOutlineIcon />}
                              onClick={() => openConfirm("approve", g)}
                              disabled={loading}
                            >
                              {t("common.approve")}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelOutlinedIcon />}
                              onClick={() => openConfirm("reject", g)}
                              disabled={loading}
                            >
                              {t("common.reject")}
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={rows.length}
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

      </Paper>

      <Dialog open={confirm.open} onClose={closeConfirm}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm.garage
              ? t("admin.garages.confirmBody", {
                action: confirmActionText,
                name: confirm.garage.name,
                city: confirm.garage.city,
              })
              : t("common.areYouSure")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>{t("common.cancel")}</Button>
          <Button onClick={runAction} variant="contained" color={confirm.action === "approve" ? "primary" : "error"}>
            {confirm.action === "approve" ? t("common.approve") : t("common.reject")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
