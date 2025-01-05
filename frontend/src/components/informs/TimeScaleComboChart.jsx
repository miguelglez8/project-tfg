import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const generateRecentDaysLabels = (daysOfWeek, yesterday, todayy, tomorrow) => {
  const labels = [];
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  labels.push(yesterday);
  labels.push(todayy);
  labels.push(tomorrow);

  const dayAfterTomorrow = new Date(today.getTime() + (2 * oneDay));
  labels.push(`${daysOfWeek[dayAfterTomorrow.getDay()]}`);

  for (let i = 0; i < 3; i++) {
    const nextDay = new Date(today.getTime() + ((i + 3) * oneDay));
    labels.push(`${daysOfWeek[nextDay.getDay()]}`);
  }

  return labels;
};


const TimeScaleComboChart = ({ control }) => {
  const { t } = useTranslation();
  const daysOfWeek = [
    t('informs.sunday'),
    t('informs.monday'),
    t('informs.tuesday'),
    t('informs.wednesday'),
    t('informs.thursday'),
    t('informs.friday'),
    t('informs.saturday')
  ];

  const completedTasksData = control?.map(item => item.completedTasks);
  const eventsData = control?.map(item => item.events);
  const tasksData = control?.map(item => item.tasks);
  const labels = generateRecentDaysLabels(daysOfWeek, t('informs.yesterday'), t('informs.today'), t('informs.tomorrow'));

  const data = {
    labels: labels,
    datasets: [
      {
        label: t('informs.line_chart_event_label'),
        data: eventsData,
        type: 'bar',
        borderColor: 'rgb(75, 192, 235)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: t('informs.line_chart_task_label'),
        data: tasksData,
        type: 'bar',
        borderColor: 'rgb(255, 99, 235)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: t('informs.line_chart_completed_task_label'),
        data: completedTasksData,
        type: 'line',
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t('informs.control_week_title')
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: t('informs.x_axis_title2')
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

  return <Bar data={data} options={options} />;
};

TimeScaleComboChart.propTypes = {
  control: PropTypes.arrayOf(
    PropTypes.shape({
      completedTasks: PropTypes.number.isRequired,
      events: PropTypes.number.isRequired,
      tasks: PropTypes.number.isRequired,
    })
  ),
};

export default TimeScaleComboChart;
