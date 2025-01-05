import { SortableContext, useSortable } from '@dnd-kit/sortable';
import TrashIcon from '../../icons/TrashIcon';
import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';
import PlusIcon from '../../icons/PlusIcon';
import TaskCard from './TaskCard';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  fetchDefaultTasks
}) {
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState(false);
  const [number, setNumber] = useState(0);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [truncateTitle, setTruncateTitle] = useState(true);

  const toggleTruncate = () => {
    setTruncateTitle(!truncateTitle);
  };

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  useEffect(() => {
    setNumber(tasks.length);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: transform,
    marginLeft: '-23px',
    marginRight: '15px'
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength - 3) + '...';
    } else {
      return text;
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
        opacity-40
        border-2
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col
        scrollbar-track-white
        overflow-y-auto
      "
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
      bg-columnBackgroundColor
      w-[350px]
      h-[500px]
      max-h-[500px]
      rounded-md
      flex
      flex-col
      overflow-y-auto
      scrollbar-track-white
    "
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
          toggleTruncate();
        }}
        className={`
          ${editMode ? 'bg-white' : 'bg-mainBackgroundColor'}
          text-md
          h-[60px]
          cursor-grab
          rounded-md
          rounded-b-none
          p-3
          font-bold
          border-columnBackgroundColor
          border-4
          flex
          items-center
          justify-between
        `}
      >
        <div className="flex gap-2" style={{ maxWidth: '260px', overflow: 'hidden' }}>
          <Tooltip title={t('tasks.number_tasks')}>
          <div
            className="
              flex
              justify-center
              items-center
              bg-columnBackgroundColor
              px-2
              py-1
              text-sm
              rounded-full
            "
          >
            {number}
          </div>
          </Tooltip>
          {!editMode && (
            <div style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {truncateTitle ? truncateText(column.title, 25) : column.title}
            </div>
          )}
          {editMode && (
            <Tooltip title={t('tasks.edit_state')}>
              <input
                className={`bg-white border rounded outline-none px-2 ${columnTitle == "" ? 'border-red-500' : 'focus:border-blue-500'}`}
                value={columnTitle}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setColumnTitle(newTitle);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditMode(false);
                    updateColumn(column.id, columnTitle);
                  }
                }}
                autoFocus
              />
            </Tooltip>
          )}
        </div>
        <Tooltip title={t('tasks.remove_state')}>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="
            stroke-gray-500
            hover:stroke-white
            hover:bg-columnBackgroundColor
            rounded
            px-1
            py-2
          "
        >
          <TrashIcon />
        </button>
        </Tooltip>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              fetchDefaultTasks={fetchDefaultTasks}
            />
          ))}
        </SortableContext>
      </div>
        <button
          className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 hover:border-blue-800 flex gap-2"
          onClick={() => {
              createTask(column.id);
            }}
          >
          <PlusIcon />
          {t('tasks.add')}
        </button>
    </div>
  );
}

ColumnContainer.propTypes = {
  column: PropTypes.object.isRequired,
  deleteColumn: PropTypes.func.isRequired,
  updateColumn: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
  tasks: PropTypes.array.isRequired,
  deleteTask: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  fetchDefaultTasks: PropTypes.func.isRequired
};

export default ColumnContainer;
