import { useState } from 'react';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const RoleSelection = ({ onUpdateRole, disabled }) => {
  const { t } = useTranslation();

  const [role, setRole] = useState('STUDENT');

  const handleChange = (event) => {
    if (!disabled) {
      const newRole = event.target.value;
      setRole(newRole);
      onUpdateRole(newRole);
    }
  };

  return (
    <Grid container justifyContent="center">
      <div>
        <Typography variant="subtitle1" component="div" sx={{ marginTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          {t('role_selection.select_role')}<span style={{ color: 'black', marginLeft: '5px' }}>*</span>
        </Typography>
        <RadioGroup
          disabled={disabled}
          aria-label="role"
          name="role"
          value={role}
          onChange={handleChange}
        >
          <FormControlLabel value="STUDENT" control={<Radio />} label={t('role_selection.student')} />
          <FormControlLabel value="TEACHER" control={<Radio />} label={t('role_selection.teacher')} />
        </RadioGroup>
      </div>
    </Grid>
  );
};

RoleSelection.propTypes = {
  onUpdateRole: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default RoleSelection;
