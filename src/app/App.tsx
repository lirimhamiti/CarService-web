import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { LanguageSwitcher } from "../shared/i18n/LanguageSwitcher";

export function App() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="header"
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <LanguageSwitcher />
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: { xs: "auto", md: "hidden" },
          overflowX: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
          <Outlet />
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          © {new Date().getFullYear()} CarService. All rights reserved.
        </Container>
      </Box>
    </Box>
  );
}
