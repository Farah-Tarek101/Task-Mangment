import { apiRequest } from './api.js';
import { clearSession, setSession, state } from './state.js';
import { renderHeader, renderProjects, renderTasks, showToast } from './ui.js';
console.debug('[main.js] loaded (v2)');

const elements = {
  loginTab: document.getElementById('loginTab'),
  registerTab: document.getElementById('registerTab'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  authSection: document.getElementById('authSection'),
  appSection: document.getElementById('appSection'),
  logoutButton: document.getElementById('logoutButton'),
  projectsTab: document.getElementById('projectsTab'),
  tasksTab: document.getElementById('tasksTab'),
  projectsPage: document.getElementById('projectsPage'),
  tasksPage: document.getElementById('tasksPage'),
  projectList: document.getElementById('projectList'),
  taskList: document.getElementById('taskList'),
  createProjectForm: document.getElementById('createProjectForm'),
  projectSubmitButton: document.getElementById('projectSubmitButton'),
  cancelEditProject: document.getElementById('cancelEditProject'),
  createTaskForm: document.getElementById('createTaskForm'),
  refreshProjects: document.getElementById('refreshProjects'),
  showAllTasks: document.getElementById('showAllTasks'),
  taskViewTitle: document.getElementById('taskViewTitle'),
  taskViewSubtitle: document.getElementById('taskViewSubtitle'),
  toast: document.getElementById('toast'),
  projectCount: document.getElementById('projectCount'),
  taskCount: document.getElementById('taskCount'),
  taskSearch: document.getElementById('taskSearch'),
  statusFilter: document.getElementById('statusFilter'),
  priorityFilter: document.getElementById('priorityFilter'),
  clearFiltersButton: document.getElementById('clearFiltersButton'),
  applyFiltersButton: document.getElementById('applyFiltersButton'),
  sortBy: document.getElementById('sortBy'),
  sortOrder: document.getElementById('sortOrder'),
  pageLimit: document.getElementById('pageLimit'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  pageIndicator: document.getElementById('pageIndicator'),
};

let taskSearchTimer = 0;

function getFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

function setButtonLoading(button, isLoading, label = 'Loading...') {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent || '';
    button.textContent = label;
    button.disabled = true;
  } else {
  
    if (button.dataset.originalText !== undefined) {
      button.textContent = button.dataset.originalText || label;
    }
    button.disabled = false;
  }
}

function getTaskFilters() {
  const search = elements.taskSearch?.value.trim();
  const status = elements.statusFilter?.value;
  const priority = elements.priorityFilter?.value;
  const sort_by = elements.sortBy?.value;
  const sort_order = elements.sortOrder?.value;
  const limit = elements.pageLimit?.value;
  const page = state.taskPagination?.page || 1;

  return {
    search,
    status,
    priority,
    sort_by,
    sort_order,
    limit,
    page,
    hasFilters: Boolean(search || status || priority),
  };
}

function buildTaskRoute(filters) {
  const queryParts = [];

  if (filters.search) queryParts.push(`q=${encodeURIComponent(filters.search)}`);
  if (filters.status) queryParts.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.priority) queryParts.push(`priority=${encodeURIComponent(filters.priority)}`);
  if (filters.sort_by) queryParts.push(`sort_by=${encodeURIComponent(filters.sort_by)}`);
  if (filters.sort_order) queryParts.push(`sort_order=${encodeURIComponent(filters.sort_order)}`);
  if (filters.limit) queryParts.push(`limit=${encodeURIComponent(filters.limit)}`);
  if (filters.page) queryParts.push(`page=${encodeURIComponent(filters.page)}`);

  const query = queryParts.length ? `?${queryParts.join('&')}` : '';

  if (filters.hasFilters) {
    if (state.selectedProjectId && !state.showingAllTasks) {
      return `/api/projects/${state.selectedProjectId}/tasks${query}`;
    }
    return `/api/tasks${query}`;
  }

  if (state.showingAllTasks || !state.selectedProjectId) {
    return `/api/tasks${query}`;
  }

  return `/api/projects/${state.selectedProjectId}/tasks${query}`;
}

function updateSearchResults() {
  window.clearTimeout(taskSearchTimer);
  taskSearchTimer = window.setTimeout(() => {
    loadTasks();
  }, 250);
}

function triggerTaskSearch() {
  showToast(elements, 'Searching tasks...');
  loadTasks();
}

function toggleAuthTab(isLogin) {
  elements.loginTab.classList.toggle('active', isLogin);
  elements.registerTab.classList.toggle('active', !isLogin);
  elements.loginForm.classList.toggle('hidden', !isLogin);
  elements.registerForm.classList.toggle('hidden', isLogin);
}

function showAppSection() {
  elements.authSection.classList.add('hidden');
  elements.appSection.classList.remove('hidden');
  elements.logoutButton.classList.remove('hidden');
}

function showAuthSection() {
  elements.authSection.classList.remove('hidden');
  elements.appSection.classList.add('hidden');
  elements.logoutButton.classList.add('hidden');
}

async function loadProjects() {
  try {
    const result = await apiRequest('/api/projects');
    state.projects = result.data || [];
    renderProjects(elements);
    if (!state.selectedProjectId && state.projects.length) {
      state.selectedProjectId = state.projects[0].id;
    }
    renderHeader(elements);
    await loadTasks();
  } catch (error) {
    if (error.message.includes('token')) {
      clearSession();
      showAuthSection();
      showToast(elements, 'Session expired. Please log in again.');
      return;
    }
    showToast(elements, error.message);
  }
}

async function loadTasks() {
  if (!state.token) return;
  const filters = getTaskFilters();
  const route = buildTaskRoute(filters);

  console.debug('[loadTasks] route:', route, 'filters:', filters);

  try {
    const result = await apiRequest(route);
    state.tasks = result.data || [];
    state.taskPagination = result.pagination || null;
    renderHeader(elements, filters.hasFilters);
    renderTasks(elements, filters.hasFilters);
    
    const meta = state.taskPagination;
    if (meta) {
      elements.pageIndicator && (elements.pageIndicator.textContent = `Page ${meta.page} of ${meta.total_pages}`);
    }
  } catch (error) {
    showToast(elements, error.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const payload = getFormData(form);
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
    setSession(data.token, data.user?.name || 'Guest');
    showAppSection();
    await loadProjects();
    showToast(elements, 'Welcome back!');
    form.reset();
  } catch (error) {
    showToast(elements, error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const payload = getFormData(form);
  try {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
    const loginData = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
    setSession(loginData.token, loginData.user?.name || 'Guest');
    showAppSection();
    await loadProjects();
    showToast(elements, 'Account created. Signed in successfully.');
    form.reset();
  } catch (error) {
    showToast(elements, error.message);
  }
}

async function handleProjectSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const payload = getFormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  if (!payload.name) {
    showToast(elements, 'Project name is required.');
    return;
  }
  try {
    setButtonLoading(submitButton, true);
    if (state.editingProjectId) {
     
      await apiRequest(`/api/projects/${state.editingProjectId}`, {
        method: 'PUT',
        body: payload,
      });
      showToast(elements, 'Project updated.');
      state.editingProjectId = null;
      elements.projectSubmitButton.textContent = 'Create project';
      elements.cancelEditProject.classList.add('hidden');
      form.reset();
      await loadProjects();
      
      if (state.selectedProjectId) await loadTasks();
    } else {
      const project = await apiRequest('/api/projects', {
        method: 'POST',
        body: payload,
      });
      form.reset();
      state.selectedProjectId = project.id;
      await loadProjects();
      showToast(elements, 'Project created successfully.');
    }
  } catch (error) {
    showToast(elements, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  if (!state.selectedProjectId || state.showingAllTasks) {
    showToast(elements, 'Select a project before adding a task.');
    return;
  }
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const data = getFormData(form);
  if (!data.title) {
    showToast(elements, 'Task title is required.');
    return;
  }
  try {
    setButtonLoading(submitButton, true);
    await apiRequest(`/api/projects/${state.selectedProjectId}/tasks`, {
      method: 'POST',
      body: data,
    });
    form.reset();
    await loadTasks();
    showToast(elements, 'Task added to project.');
  } catch (error) {
    showToast(elements, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
}

async function handleProjectListClick(event) {
  const target = event.target;
  const button = target.closest('button[data-action]');
  const card = target.closest('.project-card');

  if (!button && card) {
    const projectId = card.dataset.projectId;
    if (projectId) {
      state.selectedProjectId = projectId;
      state.showingAllTasks = false;
      renderProjects(elements);
      showPage('tasks');
      await loadTasks();
    }
    return;
  }

  if (!button) return;

  const action = button.dataset.action;
  const projectId = button.dataset.projectId;
  if (!projectId) return;

  if (action === 'select') {
    state.selectedProjectId = projectId;
    state.showingAllTasks = false;
    renderProjects(elements);
    await loadTasks();
    return;
  }

  if (action === 'delete') {
    const confirmed = window.confirm('Delete this project and all its tasks?');
    if (!confirmed) return;
    try {
      await apiRequest(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (state.selectedProjectId === projectId) {
        state.selectedProjectId = null;
      }
      await loadProjects();
      showToast(elements, 'Project deleted.');
    } catch (error) {
      showToast(elements, error.message);
    }
    return;
  }

  if (action === 'edit') {
    
    const project = state.projects.find((item) => item.id === projectId);
    if (!project) return;
    state.editingProjectId = projectId;
    
    const nameInput = elements.createProjectForm.querySelector('input[name="name"]');
    const descInput = elements.createProjectForm.querySelector('input[name="description"]');
    if (nameInput) nameInput.value = project.name || '';
    if (descInput) descInput.value = project.description || '';
    elements.projectSubmitButton.textContent = 'Save changes';
    elements.cancelEditProject.classList.remove('hidden');
    
    nameInput?.focus();
    return;
  }
}

async function handleTaskListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const container = button.closest('[data-task-id]');
  if (!container) return;
  const taskId = container.dataset.taskId;
  if (!taskId) return;

  if (action === 'delete') {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    try {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      await loadTasks();
      showToast(elements, 'Task deleted.');
    } catch (error) {
      showToast(elements, error.message);
    }
    return;
  }

  if (action === 'clear-date') {
    try {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { due_date: null },
      });
      await loadTasks();
      showToast(elements, 'Due date cleared.');
    } catch (error) {
      showToast(elements, error.message);
    }
    return;
  }

  if (action === 'update') {
    const statusInput = container.querySelector('select[data-field="status"]');
    const priorityInput = container.querySelector('select[data-field="priority"]');
    const dueDateInput = container.querySelector('input[data-field="due_date"]');
    const payload = {
      status: statusInput?.value,
      priority: priorityInput?.value,
      due_date: dueDateInput?.value || null,
    };

    try {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: payload,
      });
      await loadTasks();
      showToast(elements, 'Task updated successfully.');
    } catch (error) {
      showToast(elements, error.message);
    }
  }
}

async function handleShowAllTasks() {
  state.showingAllTasks = !state.showingAllTasks;
  showPage('tasks');
  renderHeader(elements);
  await loadTasks();
}

function showPage(page) {
  const showProjects = page === 'projects';
  elements.projectsPage?.classList.toggle('hidden', !showProjects);
  elements.tasksPage?.classList.toggle('hidden', showProjects);
  elements.projectsTab?.classList.toggle('active', showProjects);
  elements.tasksTab?.classList.toggle('active', !showProjects);
}

function clearTaskFilters() {
  if (elements.taskSearch) elements.taskSearch.value = '';
  if (elements.statusFilter) elements.statusFilter.value = '';
  if (elements.priorityFilter) elements.priorityFilter.value = '';
  loadTasks();
}

function handleLogout() {
  clearSession();
  showAuthSection();
  renderProjects(elements);
  renderTasks(elements);
}

function init() {
  if (!elements.loginTab || !elements.registerTab || !elements.loginForm || !elements.registerForm || !elements.createProjectForm || !elements.createTaskForm || !elements.projectList || !elements.taskList || !elements.logoutButton || !elements.refreshProjects || !elements.showAllTasks) {
    return;
  }

  elements.loginTab.addEventListener('click', () => toggleAuthTab(true));
  elements.registerTab.addEventListener('click', () => toggleAuthTab(false));
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.registerForm.addEventListener('submit', handleRegister);
  elements.createProjectForm.addEventListener('submit', handleProjectSubmit);
  elements.createTaskForm.addEventListener('submit', handleTaskSubmit);
  elements.projectList.addEventListener('click', handleProjectListClick);
  elements.taskList.addEventListener('click', handleTaskListClick);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.refreshProjects.addEventListener('click', loadProjects);
  elements.showAllTasks.addEventListener('click', handleShowAllTasks);
  elements.projectsTab?.addEventListener('click', () => showPage('projects'));
  elements.tasksTab?.addEventListener('click', async () => {
    showPage('tasks');
    await loadTasks();
  });
  elements.clearFiltersButton?.addEventListener('click', (event) => {
    event.preventDefault();
    clearTaskFilters();
  });
  elements.cancelEditProject?.addEventListener('click', (event) => {
    event.preventDefault();
    
    state.editingProjectId = null;
    elements.createProjectForm.reset();
    elements.projectSubmitButton.textContent = 'Create project';
    elements.cancelEditProject.classList.add('hidden');
  });
  elements.applyFiltersButton?.addEventListener('click', (event) => {
    event.preventDefault();
    triggerTaskSearch();
  });
  elements.taskSearch?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loadTasks();
    }
  });
  elements.taskSearch?.addEventListener('input', updateSearchResults);
  elements.statusFilter?.addEventListener('change', updateSearchResults);
  elements.priorityFilter?.addEventListener('change', updateSearchResults);
  elements.sortBy?.addEventListener('change', () => { if (state.taskPagination) state.taskPagination.page = 1; loadTasks(); });
  elements.sortOrder?.addEventListener('change', () => { if (state.taskPagination) state.taskPagination.page = 1; loadTasks(); });
  elements.pageLimit?.addEventListener('change', () => { if (!state.taskPagination) state.taskPagination = { page: 1 }; else state.taskPagination.page = 1; loadTasks(); });
  elements.prevPage?.addEventListener('click', async () => { if (!state.taskPagination) return; if (state.taskPagination.page > 1) { state.taskPagination.page -= 1; await loadTasks(); } });
  elements.nextPage?.addEventListener('click', async () => { if (!state.taskPagination) return; if (state.taskPagination.page < state.taskPagination.total_pages) { state.taskPagination.page += 1; await loadTasks(); } });

  if (state.token) {
    showAppSection();
    loadProjects();
    showPage('projects');
  } else {
    showAuthSection();
  }
}

window.addEventListener('DOMContentLoaded', init);
