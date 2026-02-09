import { Button, ButtonGroup, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

type Lang = "en" | "sq" | "mk";

const labels: Record<Lang, string> = {
  en: "EN",
  sq: "SQ",
  mk: "MK",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) as Lang) || "en";

  const setLang = async (lng: Lang) => {
    await i18n.changeLanguage(lng);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 0.5,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <ButtonGroup size="small" variant="outlined">
        {(["en", "sq", "mk"] as const).map((lng) => (
          <Button
            key={lng}
            onClick={() => void setLang(lng)}
            variant={current === lng ? "contained" : "outlined"}
            sx={{ minWidth: 44 }}
          >
            {labels[lng]}
          </Button>
        ))}
      </ButtonGroup>
    </Paper>
  );
}
