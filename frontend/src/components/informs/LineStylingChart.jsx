import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const LineStylingChart = ({ control }) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: t('informs.events_label'),
        fill: false,
        borderColor: 'green',
        borderDash: [5, 5],
        data: []
      },
      {
        label: t('informs.tasks_label'),
        fill: false,
        borderColor: 'blue',
        data: []
      },
      {
        label: t('informs.completed_tasks_label'),
        fill: true,
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderColor: 'red',
        data: []
      }
    ]
  });

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t('informs.control_month_title')
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: t('informs.x_axis_title')
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: t('informs.y_axis_title')
        }
      }
    }
  };

  useEffect(() => {
    const DATA_COUNT = 6;
    const months = [
        t('informs.january'),
        t('informs.february'),
        t('informs.march'),
        t('informs.april'),
        t('informs.may'),
        t('informs.june'),
        t('informs.july'),
        t('informs.august'),
        t('informs.september'),
        t('informs.october'),
        t('informs.november'),
        t('informs.december')
    ];

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    const labels = Array.from({ length: DATA_COUNT }, (_, i) => {
      const monthIndex = (currentMonthIndex - 2 + i) % 12;
      const monthName = months[monthIndex];
      return `${monthName}`;
    });

    const data = {
      labels: labels,
      datasets: [
        {
          label: t('informs.line_chart_event_label'),
          fill: false,
          borderColor: 'green',
          borderDash: [5, 5],
          data: control?.map(month => month.events)
        },
        {
          label: t('informs.line_chart_task_label'),
          fill: false,
          borderColor: 'blue',
          data: control?.map(month => month.tasks)
        },
        {
          label: t('informs.line_chart_completed_task_label'),
          fill: true,
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          borderColor: 'red',
          data: control?.map(month => month.completedTasks)
        }
      ]
    };

    setChartData(data);
  }, [control, t]);

  return (
    <Line data={chartData} options={options} />
  );
};

LineStylingChart.propTypes = {
  control: PropTypes.arrayOf(PropTypes.shape({
    events: PropTypes.number.isRequired,
    tasks: PropTypes.number.isRequired,
    completedTasks: PropTypes.number.isRequired
  }))
};

export default LineStylingChart;
