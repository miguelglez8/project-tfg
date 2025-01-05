import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import i18n from '../../services/i18n';

const LanguageSelector = () => {
  const { t } = useTranslation();

  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <Box textAlign="center">
      <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary' }}>
        {t('login_view.language')}
      </Typography>
      <Box display="flex" justifyContent="center" mt={2}>
        <Tooltip title={t('selector.selector_es')} arrow>
          <IconButton onClick={() => handleLanguageChange('es')}>
            <img
              src="/espana.png"
              alt="Spanish Flag"
              style={{ width: '50px', height: 'auto', cursor: 'pointer' }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('selector.selector_en')} arrow>
          <IconButton onClick={() => handleLanguageChange('en')}>
            <img
              src="/reino_unido.png"
              alt="British Flag"
              style={{ width: '47px', height: 'auto', cursor: 'pointer' }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default LanguageSelector;
