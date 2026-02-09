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
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate, useParams } from "react-router-dom";
import {
  ownerGetCarByToken,
  ownerGetCarByVin,
  ownerGetServicesByToken,
  ownerGetServicesByVin,
  type OwnerServiceRecordDto,
  type OwnerCarDto,
} from "../api/ownerApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";
import TablePagination from "@mui/material/TablePagination";


function extractToken(input: string) {
  const s = decodeURIComponent(input ?? "").trim();

  try {
    const u = new URL(s);
    const t = u.searchParams.get("token");
    if (t) return t.trim();
  } catch { }

  const idx = s.toLowerCase().indexOf("token=");
  if (idx >= 0) {
    const after = s.substring(idx + "token=".length);
    const token = after.split("&")[0].trim();
    return token;
  }

  return s;
}

export function OwnerCarHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kind, value } = useParams<{ kind: "vin" | "token"; value: string }>();

  const [car, setCar] = useState<OwnerCarDto | null>(null);
  const [items, setItems] = useState<OwnerServiceRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [kind, value]);


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
      setError(e?.message ?? t("owner.history.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [kind, value]);

  const downloadReportPdf = () => {
    if (!car) return;

    const today = new Date().toISOString().slice(0, 10);
    const identifier = (kind === "vin" ? car.vin : titleValue)
      .replace(/[^a-z0-9_-]/gi, "_")
      .slice(0, 40);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text(t("owner.history.pdf.title"), 40, 50);

    doc.setFontSize(11);
    const metaLines = [
      `${t("owner.history.pdf.reportDate")}: ${today}`,
      `${t("owner.history.pdf.plate")}: ${car.plateNumber}`,
      `${t("owner.history.pdf.vin")}: ${car.vin}`,
    ];

    let y = 75;
    for (const line of metaLines) {
      doc.text(line, 40, y);
      y += 16;
    }

    const rows = items.map((s) => [
      `${s.garageName} (${s.garageCity})`,
      s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : "-",
      String(s.mileage ?? "-"),
      s.notes ?? "-",
      s.createdAt ? new Date(s.createdAt).toLocaleString() : "-",
    ]);

    autoTable(doc, {
      startY: y + 10,
      head: [[
        t("owner.history.table.garage"),
        t("owner.history.table.date"),
        t("owner.history.table.mileage"),
        t("owner.history.table.notes"),
        t("owner.history.table.created"),
      ]],
      body: rows,
      styles: { fontSize: 10, cellPadding: 6, overflow: "linebreak" },
      headStyles: { fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 70 },
        2: { cellWidth: 80 },
        3: { cellWidth: 150 },
        4: { cellWidth: 90 },
      },
    });

    doc.save(`service-history-${identifier}-${today}.pdf`);
  };

  const pagedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, page, rowsPerPage]);


  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }} style={{ paddingTop: '7vh' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {t("owner.history.title")}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {kind === "vin" ? t("owner.history.vin") : t("owner.history.token")}:{" "}
              <b>{titleValue}</b>
            </Typography>

            {car && (
              <Typography variant="body2" color="text.secondary">
                {t("owner.history.plate")}: <b>{car.plateNumber}</b>
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: { xs: "flex-start", sm: "flex-end" },
              minWidth: { sm: 420 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadReportPdf}
              disabled={loading || !car}
              size="small"
              fullWidth
            >
              {t("owner.history.actions.download")}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/owner")}
              size="small"
              fullWidth
            >
              {t("common.back")}
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void load()}
              disabled={loading}
              size="small"
              fullWidth
            >
              {t("common.refresh")}
            </Button>
          </Stack>

        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
        >
          <CardContent>
            {loading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography>{t("common.loading")}</Typography>
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">
                {t("owner.history.empty")}
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid", borderColor: "grey.200" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>{t("owner.history.table.garage")}</b></TableCell>
                      <TableCell><b>{t("owner.history.table.date")}</b></TableCell>
                      <TableCell><b>{t("owner.history.table.mileage")}</b></TableCell>
                      <TableCell><b>{t("owner.history.table.notes")}</b></TableCell>
                      <TableCell><b>{t("owner.history.table.created")}</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pagedItems.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>
                          {s.garageName} ({s.garageCity})
                        </TableCell>
                        <TableCell>
                          {s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>{s.mileage ?? "-"}</TableCell>
                        <TableCell>{s.notes || "-"}</TableCell>
                        <TableCell>
                          {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
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
                />
              </TableContainer>

            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
