import { useState, useEffect } from 'react';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { STATS_API } from '../../routes/api-routes';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const Stats = () => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get(`${STATS_API}/${user}`);
                setStats(response.data);
            } catch (error) {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user, navigate]);

    return (
        <Grid container spacing={1} style={{ marginLeft: '10px' }}>
            <Grid item xs={12}>
                <Typography variant="h4" align="center" gutterBottom style={{ marginTop: "20px" }}>{t('stats.titleS')}</Typography>
            </Grid>
            <Grid item xs={12}>
                <TableContainer>
                    <Table aria-label="stats table">
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="h5" align="center" style={{ marginBottom: '10px' }}>{t('stats.title')}:</Typography>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="jobs table">
                                            <TableBody>
                                                {stats === null || stats?.participatingJobs === 0 ? (
                                                    <TableRow>
                                                        <TableCell style={{ textAlign: 'center' }} colSpan={2}>{t('stats.noJobs')}</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.assignedJobs')}</b></TableCell>
                                                            <TableCell>{stats?.participatingJobs}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageJobGrade')}</b></TableCell>
                                                            <TableCell>{stats?.averageJobGrade}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.completedJobsPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.completedJobsPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.jobsDeadlineStatusPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.jobsDeadlineStatusPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageTasksPerJob')}</b></TableCell>
                                                            <TableCell>{stats?.averageTasksPerJob.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageEventsPerJob')}</b></TableCell>
                                                            <TableCell>{stats?.averageEventsPerJob.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    </>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="h5" align="center" style={{ marginBottom: '10px' }}>{t('stats.titleT')}:</Typography>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="tasks table">
                                            <TableBody>
                                                {stats === null || stats?.assignedTasks === 0 ? (
                                                    <TableRow>
                                                        <TableCell style={{ textAlign: 'center' }} colSpan={2}>{t('stats.noTasks')}</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.realizedTasks')}</b></TableCell>
                                                            <TableCell>{stats?.realizedTasks}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.assignedTasks')}</b></TableCell>
                                                            <TableCell>{stats?.assignedTasks}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.completedTasksPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.completedTasksPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.remainingTasksPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.remainingTasksPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageObjectivesPerTask')}</b></TableCell>
                                                            <TableCell>{stats?.averageObjectivesPerTask.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.completedObjectivesPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.completedObjectivesPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.tasksDeadlineStatusPercentage')}</b></TableCell>
                                                            <TableCell>{stats?.tasksDeadlineStatusPercentage.toFixed(2)}%</TableCell>
                                                        </TableRow>
                                                    </>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="h5" align="center" style={{ marginBottom: '10px' }}>{t('stats.titleE')}:</Typography>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="events table">
                                            <TableBody>
                                                {stats === null || (stats?.fullTimeEvents === 0 && stats?.partTimeEvents === 0) ? (
                                                    <TableRow>
                                                        <TableCell style={{ textAlign: 'center' }} colSpan={2}>{t('stats.noEvents')}</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.fullTimeEvents')}</b></TableCell>
                                                            <TableCell>{stats?.fullTimeEvents}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.partTimeEvents')}</b></TableCell>
                                                            <TableCell>{stats?.partTimeEvents}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageEventDuration')}</b></TableCell>
                                                            <TableCell>{stats?.averageEventDuration.toFixed(2)}h</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><b>{t('stats.averageParticipantsPerEvent')}</b></TableCell>
                                                            <TableCell>{stats?.averageParticipantsPerEvent.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    </>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default Stats;
