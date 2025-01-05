import { useState } from 'react';
import Button from '@mui/material/Button';
import DoneIcon from '@mui/icons-material/Done';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

const UploadImageButton = ({ disabled, onImageUploaded }) => {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    if (disabled) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        try {
          setUploading(true);
          setFile(selectedFile);
          setError('');
          await onImageUploaded(selectedFile);
        } catch (error) {
          setError(t('upload_image_button.upload_error'));
        } finally {
          setUploading(false);
        }
      } else {
        setFile(null);
        setError(t('upload_image_button.invalid_file'));
      }
    }
  };

  return (
    <div style={{ marginRight: '7.5px' }}>
      <Tooltip title={t('upload_image_button.tooltip')} arrow>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadOutlinedIcon />}
          fullWidth
          color={error ? "error" : (file ? "success" : "primary")}
          disabled={uploading || disabled}
          sx={{ 
            borderColor: error ? "#f44336" : (file ? "#4caf50" : "currentColor"),
            '&:hover': {
              borderColor: error ? "#f44336" : (file ? "#4caf50" : "currentColor"),
            }
          }}
        >
        {uploading ? t('upload_image_button.uploading') : t('upload_image_button.profile_image')}
        <input
          type="file"
          style={{ display: 'none', alignContent: 'center' }}
          onChange={handleFileChange}
          disabled={uploading || disabled}
          accept="image/*"
        />
      </Button>
          {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
          {file && (
            <p style={{ color: 'green', display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              <DoneIcon style={{ marginRight: '5px' }} />
              {file.name}
            </p>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

UploadImageButton.propTypes = {
  disabled: PropTypes.bool,
  onImageUploaded: PropTypes.func.isRequired
};

export default UploadImageButton;
