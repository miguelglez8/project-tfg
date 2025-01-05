import { useState, useEffect } from 'react';
import { Grid, MenuItem, Select, Typography } from '@mui/material';
import { INFORMS_API, JOBS_API } from '../../routes/api-routes';
import { useTranslation } from 'react-i18next';
import TimeScaleComboChart from './TimeScaleComboChart';
import DoughnutChart from './DoughnutChart';
import LineStylingChart from './LineStylingChart';
import { LOGIN_PATH } from '../../routes/app-routes';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import { clearLocalStorage } from '../../App';

const Informs = () => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [controlWeekly, setWeeklyControl] = useState(null);
    const [controlMonthly, setMonthlyControl] = useState(null);
    const [participation, setParticipation] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axiosInstance.get(`${JOBS_API}/${user}/job-relations`);
                setJobs(response.data);
                if (response.data.length > 0) {
                    setSelectedJob(response.data[0].name);
                }
            } catch (error) {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
                console.error('Error fetching jobs:', error);
            }
        };

        fetchJobs();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedJob !== "") {
            const fetchParticipation = async () => {
                try {
                    const response = await axiosInstance.get(`${INFORMS_API}/${selectedJob}/participation?user=` + user);
                    setParticipation(response.data);
                } catch (error) {
                    if (error.response.status == 401) {
                        clearLocalStorage();
                        navigate(LOGIN_PATH);
                    }
                    console.error('Error fetching stats:', error);
                }
            };

            fetchParticipation();
        } else {
            setParticipation(null);
        }
    }, [selectedJob, user, navigate]);

    useEffect(() => {
        if (selectedJob !== "") {
            const fetchWeeklyControl = async () => {
                try {
                    const response = await axiosInstance.get(`${INFORMS_API}/${selectedJob}/controlWeek`);
                    setWeeklyControl(response.data);
                } catch (error) {
                    if (error.response.status == 401) {
                        clearLocalStorage();
                        navigate(LOGIN_PATH);
                    }
                    console.error('Error fetching stats:', error);
                }
            };

            fetchWeeklyControl();
        } else {
            setWeeklyControl(null);
        }
    }, [selectedJob, user, navigate]);

    useEffect(() => {
        if (selectedJob !== "") {
            const fetchMonthlyControl = async () => {
                try {
                    const response = await axiosInstance.get(`${INFORMS_API}/${selectedJob}/controlMonth`);
                    setMonthlyControl(response.data);
                } catch (error) {
                    if (error.response.status == 401) {
                        clearLocalStorage();
                        navigate(LOGIN_PATH);
                    }
                    console.error('Error fetching stats:', error);
                }
            };

            fetchMonthlyControl();
        } else {
            setMonthlyControl(null);
        }
    }, [selectedJob, user, navigate]);

    const handleJobChange = (event) => {
        setSelectedJob(event.target.value);
    };

    return (
        <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginLeft: '5px' }}>
            <Grid item xs={12}>
                <Typography variant="h4" align="center" gutterBottom style={{ marginTop: "20px" }}>{t('informs.title')}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5" align="center" gutterBottom style={{ marginTop: "10px" }}>{t('jobs.select')}</Typography>
                <Select value={selectedJob} onChange={handleJobChange} style={{ marginTop: "10px", width: '250px', display: 'block', margin: '0 auto' }}>
                    {jobs.length === 0 && (
                        <MenuItem value="">
                            <em>{t('informs.noAssignedJobs')}</em>
                        </MenuItem>
                    )}
                    {jobs.map((job) => (
                        <MenuItem key={job.id} value={job.name}>
                            {job.name}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
                {selectedJob && (
                    <Typography variant="h5" align="center" gutterBottom style={{ marginTop: "20px" }}>{t('informs.weeklyTaskEventControl')}:</Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6} style={{ maxWidth: '45vw', minWidth: '400px', margin: '20 auto' }}>
                {selectedJob && (
                    <TimeScaleComboChart control={controlWeekly} />
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                {selectedJob && (
                    <Typography variant="h5" align="center" gutterBottom style={{ marginTop: "20px" }}>{t('informs.monthlyWorkEvolution')}:</Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6} style={{ maxWidth: '45vw', minWidth: '400px', margin: '20 auto' }}>
                {selectedJob && (
                    <LineStylingChart control={controlMonthly} />
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                {selectedJob && (
                    <Typography variant="h5" align="center" gutterBottom style={{ marginTop: "20px" }}>{t('informs.memberParticipation')}:</Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6} style={{ maxWidth: '20vw', minWidth: '300px', margin: '20 auto' }}>
                {selectedJob && (
                    <DoughnutChart participation={participation} />
                )}
            </Grid>
        </Grid>
    );
};

export default Informs;
