import { state } from './state.js';

function escapeHTML(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const PRIORITIES = ['low', 'medium', 'high'];

export function formatInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  
  return date.toLocaleDateString('en-CA');
}

export function renderHeader(elements, isSearchMode = false) {
  if (!elements.taskViewTitle) return;

  const projectCount = state.projects.length;
  const project = state.projects.find((project) => project.id === state.selectedProjectId);

  if (isSearchMode) {
    elements.taskViewTitle.textContent = 'Search results';
    elements.taskViewSubtitle.textContent = `Showing filtered tasks${project ? ` in ${project.name}` : ''}`;
    elements.showAllTasks.textContent = 'View all tasks';
  } else if (state.showingAllTasks) {
    elements.taskViewTitle.textContent = 'All tasks';
    elements.taskViewSubtitle.textContent = `Showing tasks across ${projectCount} project${projectCount === 1 ? '' : 's'}`;
    elements.showAllTasks.textContent = 'View selected project';
  } else if (project) {
    elements.taskViewTitle.textContent = project.name;
    elements.taskViewSubtitle.textContent = project.description || `Viewing tasks for ${project.name}.`;
    elements.showAllTasks.textContent = 'View all tasks';
  } else if (projectCount) {
    elements.taskViewTitle.textContent = 'Pick a project';
    elements.taskViewSubtitle.textContent = 'Choose a project from the list to manage its tasks.';
    elements.showAllTasks.textContent = 'View all tasks';
  } else {
    elements.taskViewTitle.textContent = 'No projects yet';
    elements.taskViewSubtitle.textContent = 'Create a project to start adding tasks.';
    elements.showAllTasks.textContent = 'View all tasks';
  }

  if (elements.showAllTasks) {
    elements.showAllTasks.classList.toggle('hidden', projectCount === 0);
  }

  if (elements.projectCount) {
    elements.projectCount.textContent = String(projectCount);
  }
  if (elements.taskCount) {
    elements.taskCount.textContent = String(state.tasks.length);
  }
}

export function renderProjects(elements) {
  if (!elements.projectList) return;
  elements.projectList.innerHTML = '';

  if (!state.projects.length) {
    elements.projectList.innerHTML = '<div class="list-card"><p class="subtle">You currently have no projects. Create one to start assigning tasks.</p></div>';
    return;
  }

  state.projects.forEach((project) => {
    const item = document.createElement('div');
    item.className = `project-card ${project.id === state.selectedProjectId ? 'active' : ''}`;
    item.dataset.projectId = project.id;
    const projectName = escapeHTML(project.name);
    const projectDescription = escapeHTML(project.description || 'No project description yet.');
    item.innerHTML = `
      <div>
        <strong>${projectName}</strong>
        <p>${projectDescription}</p>
      </div>
      <div class="project-actions">
        <button type="button" class="ghost-button small" data-action="edit" data-project-id="${project.id}">Edit</button>
        <button type="button" class="ghost-button small danger" data-action="delete" data-project-id="${project.id}">Delete</button>
      </div>
    `;
    elements.projectList.appendChild(item);
  });
}

export function renderTasks(elements, hasFilters = false) {
  if (!elements.taskList) return;
  elements.taskList.innerHTML = '';

  if (!state.tasks.length) {
    const message = hasFilters
      ? 'No tasks match your filters. Adjust search or clear filters.'
      : 'Create your first task to get started.';
    elements.taskList.innerHTML = `<div class="list-card empty-state"><p class="empty-emoji">📋</p><h4>No tasks found</h4><p class="subtle">${message}</p></div>`;
    return;
  }

  state.tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'list-card';
    item.dataset.taskId = task.id;
    const title = escapeHTML(task.title);
    const description = escapeHTML(task.description || 'No details added yet.');
    const projectLabel = state.showingAllTasks && task.project_name ? `<span class="pill project-pill">${escapeHTML(task.project_name)}</span>` : '';
    item.innerHTML = `
      <div class="item-top">
        <div class="item-title">
          <strong>${title}</strong>
          <span class="pill status-${task.status}">${escapeHTML(STATUS_LABELS[task.status] || task.status)}</span>
        </div>
        <div>
          <span class="pill priority-${task.priority}">${escapeHTML(task.priority)}</span>
          ${projectLabel}
        </div>
      </div>
        <div class="item-detail">
        <p>${description}</p>
        <div class="grid-two">
          <label>
            Status
            <select data-field="status">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </label>
          <label>
            Priority
            <select data-field="priority">
              ${PRIORITIES.map((priority) => `<option value="${escapeHTML(priority)}" ${task.priority === priority ? 'selected' : ''}>${escapeHTML(priority)}</option>`).join('')}
            </select>
          </label>
          <label>
            Due date
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="date" data-field="due_date" value="${formatInputDate(task.due_date)}" />
              <button type="button" class="ghost-button small" data-action="clear-date">Clear</button>
            </div>
          </label>
        </div>
      </div>
      <div class="item-footer">
        <button type="button" class="secondary-button small" data-action="update">Save</button>
        <button type="button" class="ghost-button small danger" data-action="delete">Delete</button>
      </div>
    `;
    elements.taskList.appendChild(item);
  });
}

const TOAST_DURATION = 3200;
export function showToast(elements, message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, TOAST_DURATION);
}
