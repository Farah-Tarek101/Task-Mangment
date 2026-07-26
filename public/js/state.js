export const state = {
  token: localStorage.getItem('task_token') || '',
  userName: localStorage.getItem('task_userName') || '',
  selectedProjectId: null,
  editingProjectId: null,
  projects: [],
  tasks: [],
  taskPagination: null,
  showingAllTasks: false,
};

export function setSession(token, name) {
  state.token = token;
  state.userName = name;
  localStorage.setItem('task_token', token);
  localStorage.setItem('task_userName', name);
}

export function clearSession() {
  state.token = '';
  state.userName = '';
  state.selectedProjectId = null;
  state.editingProjectId = null;

  state.projects = [];
  state.tasks = [];

  state.taskPagination = null;
  state.showingAllTasks = false;
  localStorage.removeItem('task_token');
  localStorage.removeItem('task_userName');
}
