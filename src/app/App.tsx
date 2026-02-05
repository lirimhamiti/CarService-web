import { Outlet } from "react-router-dom";
import { Box, Container, Stack } from "@mui/material";
import { LanguageSwitcher } from "../shared/i18n/LanguageSwitcher";

export function App() {
  return (
    <Box>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <LanguageSwitcher />
        </Stack>
        <Outlet />
      </Container>
    </Box>
  );
}
