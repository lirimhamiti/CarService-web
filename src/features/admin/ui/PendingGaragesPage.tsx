import { useEffect, useMemo, useState } from "react";
import type { GarageDto } from "../../garages/model/types";
import { approveGarage, getPendingGarages, rejectGarage } from "../api/adminApi";

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
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

type ActionType = "approve" | "reject";

export function PendingGaragesPage() {
  const [items, setItems] = useState<GarageDto[]>([]);
  const [loading, setLoading] = useState(true);

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

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPendingGarages();
      setItems(data);
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: e?.message ?? "Failed to load pending garages",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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
            ? `Approved: ${garage.name}`
            : `Rejected: ${garage.name}`,
      });

      await load();
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: e?.message ?? "Action failed",
      });
      setLoading(false);
    }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Pending Garages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review registrations and approve or reject access.
          </Typography>
        </Box>

        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={load} disabled={loading} aria-label="refresh">
              <RefreshOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Loading overlay */}
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

        <TableContainer sx={{ maxHeight: "calc(100dvh - 220px)" }}>
          <Table stickyHeader aria-label="pending garages table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Garage</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, width: 220 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography fontWeight={700}>No pending garages</Typography>
                      <Typography variant="body2" color="text.secondary">
                        New registrations will appear here.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((g) => (
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
                      <Chip label="Pending" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => openConfirm("approve", g)}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => openConfirm("reject", g)}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirm Dialog */}
      <Dialog open={confirm.open} onClose={closeConfirm}>
        <DialogTitle>
          {confirm.action === "approve" ? "Approve garage?" : "Reject garage?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm.garage ? (
              <>
                Are you sure you want to{" "}
                <b>{confirm.action === "approve" ? "approve" : "reject"}</b>{" "}
                <b>{confirm.garage.name}</b> ({confirm.garage.city})?
              </>
            ) : (
              "Are you sure?"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button
            onClick={runAction}
            variant="contained"
            color={confirm.action === "approve" ? "primary" : "error"}
          >
            {confirm.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
