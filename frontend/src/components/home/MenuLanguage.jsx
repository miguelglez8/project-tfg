import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import i18n from '../../services/i18n'; 

export default function MenuLanguage( { anchorEl, handleMenuClose } ) {
    const { t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        style={{ marginTop: '12px' }}
    >
        <MenuItem onClick={() => { handleMenuClose(); changeLanguage('es'); }}>
        <img src="/espana.png" alt="Español" style={{ marginRight: 10, width: 20 }} />
        {t('selector.selector_es')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); changeLanguage('en'); }}>
        <img src="/reino_unido.png" alt="English" style={{ marginRight: 10, width: 20 }} />
        {t('selector.selector_en')}
        </MenuItem>
    </Menu>
    );
}

MenuLanguage.propTypes = {
    anchorEl: PropTypes.object,
    handleMenuClose: PropTypes.func.isRequired
};