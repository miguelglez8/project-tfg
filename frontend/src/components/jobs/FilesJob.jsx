import { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TablePagination, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import FileIcon from '../messages/FileIcon';
import { formatTime } from '../messages/Message';
import { useTranslation } from 'react-i18next';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { listFilesInFolder, uploadFileJob } from '../../services/firebase';
import { useEffect } from 'react';

const FilesJob = ({ job }) => {
  const { i18n, t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));
  }, [files]);

  const fetchFiles = async () => {
    try {
      const filesData = await listFilesInFolder(job);
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmation(false);
    if (selectedFile) {
      await uploadFileJob(selectedFile, job);
    }
    fetchFiles();
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleOpenConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    handleOpenConfirmation();
  };

  const formatSize = (sizeInBytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return size.toFixed(2) + ' ' + units[unitIndex];
  };

  const renderTableRows = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

    if (paginatedFiles.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <Typography>{t('jobs.no_files')}</Typography>
          </TableCell>
        </TableRow>
      );
    } else {
      return paginatedFiles.map((file, index) => (
        <TableRow key={index}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
          <TableCell>
            <FileIcon fileName={file.name} />
          </TableCell>
          <TableCell>{file.name}</TableCell>
          <TableCell>{formatSize(file.size)}</TableCell>
          <TableCell>{file.mimeType}</TableCell>
          <TableCell>{formatTime(file.timeCreated, i18n)}</TableCell>
          <TableCell>
            <Tooltip title={t('tasks.download_file')}>
              <Button
                variant="contained"
                color="primary"
                href={file.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<CloudDownloadIcon />}
              >
              </Button>
            </Tooltip>
          </TableCell>
        </TableRow>
      ));
    }
  };

  return (
    <div>
      <TableContainer component={Paper} style={{ marginLeft: '5px', width: '75vw' }}>
        <Typography variant="h5" gutterBottom textAlign='center' marginTop='10px'>
          {t('jobs.list_files')}
        </Typography>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.jpg,.jpeg,.png"
            id="file-input"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="file-input">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUploadIcon />}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              component="span"
              className="upload-button"
            >
              <span className="upload-text">{t('tasks.up_file')}</span>
            </Button>
          </label>
        </div>
        <Table sx={{ minWidth: 350 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{t('jobs.icon')}</TableCell>
              <TableCell>{t('jobs.name')}</TableCell>
              <TableCell>{t('jobs.size')}</TableCell>
              <TableCell>{t('jobs.type')}</TableCell>
              <TableCell>{t('jobs.recient')}</TableCell>
              <TableCell>{t('jobs.download')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableRows()}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={sortedFiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('jobs.rows')}
        />
        <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
          <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.confirm_charge')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('jobs.question')} <strong>{selectedFile && selectedFile.name}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="primary" onClick={handleCloseConfirmation}>{t('contacts.cancel_title')}</Button>
            <Button variant="contained" color="primary" onClick={handleConfirmUpload} style={{ marginRight: '10px' }}>{t('jobs.charge')}</Button>
          </DialogActions>
        </Dialog>
      </TableContainer>
    </div>
  );
};

FilesJob.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    mimeType: PropTypes.string.isRequired,
    timeCreated: PropTypes.string.isRequired,
    downloadURL: PropTypes.string.isRequired
  })),
  job: PropTypes.string.isRequired,
  fetchFiles: PropTypes.func
};

export default FilesJob;
