import { Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DoughnutChart = ({ participation }) => {
    const { t } = useTranslation();
    
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: t('informs.doughnut_chart_label'),
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });
    
    useEffect(() => {
        if (participation) {
            setChartData(prevChartData => ({
                ...prevChartData,
                labels: participation?.map((stat) => stat.user),
                datasets: [
                    {
                        ...prevChartData.datasets[0],
                        data: participation?.map((stat) => stat.contribution),
                    },
                ],
            }));
        }
    }, [participation]);

    const options = {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: t('informs.doughnut_chart_title')
          }
        }
    };

    return (
        <Doughnut data={chartData} options={options} />
    );
}

DoughnutChart.propTypes = {
    participation: PropTypes.arrayOf(
        PropTypes.shape({
            user: PropTypes.string.isRequired,
            contribution: PropTypes.number.isRequired
        })
    )
};

export default DoughnutChart;
