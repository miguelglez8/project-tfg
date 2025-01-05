import { InsertDriveFile, PictureAsPdf, Description, Image, MusicNote, VideoLibrary, Code } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import PropTypes from 'prop-types';

const FileIcon = ({ fileName }) => {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  let IconComponent;

  switch (fileExtension) {
    case "pdf":
      IconComponent = PictureAsPdf;
      break;
    case "txt":
      IconComponent = Description;
      break;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      IconComponent = Image;
      break;
    case "mp3":
    case "wav":
    case "ogg":
      IconComponent = MusicNote;
      break;
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
      IconComponent = VideoLibrary;
      break;
    case "html":
    case "css":
    case "js":
      IconComponent = Code;
      break;
    default:
      IconComponent = InsertDriveFile;
      break;
  }

  return <Tooltip title={fileExtension} arrow> <IconComponent /> </Tooltip>;
};

FileIcon.propTypes = {
  fileName: PropTypes.string.isRequired,
};

export default FileIcon;
