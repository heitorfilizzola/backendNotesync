const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
};

const VALID_TASK_STATUSES = Object.values(TASK_STATUSES);

module.exports = {
  TASK_STATUSES,
  VALID_TASK_STATUSES
};
