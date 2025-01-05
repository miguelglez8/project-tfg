import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useEffect, useState } from 'react';
import { checkImageExists } from '../../services/firebase';
import { Tooltip } from '@mui/material';

const UserProfileAvatar = ({ imageUrl, selectedStatus, value, isTask, isHome }) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    async function fetchImage() {
      if (imageUrl != undefined) {
        setImage(await checkImageExists(imageUrl));
      }
    }

    fetchImage();
  }, [imageUrl]);

  const stringToColor = (string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {image != "" && imageUrl && imageUrl.includes("@") &&
        <Tooltip title={isHome ? null : imageUrl}>
          <Avatar alt="User Avatar" src={image} />
        </Tooltip>
      }
      {imageUrl && !imageUrl.includes("@") && !isTask &&
        <Tooltip title={imageUrl}>
          <Avatar src={image} sx={{ bgcolor: stringToColor(imageUrl[0]) }}>{imageUrl[0]}</Avatar>
        </Tooltip>
      }
      {isTask && (
        <Tooltip title={imageUrl}>
          <Avatar src={image} sx={{ bgcolor: stringToColor(imageUrl[0]), height: '20px', width: '20px' }}>{imageUrl[0]}</Avatar>
        </Tooltip>
      )}
      
      {value ? (
      <div style={{
        position: 'absolute',
        top: 36,
        right: 5,
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {selectedStatus === 'AVAILABLE' && <CheckCircleIcon sx={{ color: '#00FF00', width: '16px', height: '16px' }} />}
        {selectedStatus === 'BUSY' && <CancelIcon sx={{ color: '#FF0000', width: '16px', height: '16px' }} />}
        {selectedStatus === 'AWAY' && <AccessTimeFilledIcon sx={{ color: '#FFD700', width: '16px', height: '16px' }} />}
        {selectedStatus === 'OFFLINE' && <WifiOffIcon sx={{ color: '#808080', width: '16px', height: '16px' }} />}
      </div>) : null}    
    </Stack>
  );
};

UserProfileAvatar.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  selectedStatus: PropTypes.string,
  value: PropTypes.bool,
  isTask: PropTypes.bool,
  isHome: PropTypes.bool,
};

export default UserProfileAvatar;
