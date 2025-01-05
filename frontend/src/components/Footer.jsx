import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export function Copyright(props) {
  const { t } = useTranslation();

  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'©'}       
      {' '}
      {t('footer.coordination_footer')}
      {' - Miguel González Navarro '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Footer() {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '90px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          py: 3,
          px: 2,
        }}
      >
        <Typography variant="body1" align="center">
          {t('footer.reserved_rights')}
        </Typography>
        <Copyright />
      </Box>
    </ThemeProvider>
  );
}
