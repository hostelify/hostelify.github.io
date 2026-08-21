admin-dashboard.js

// ============================================================
// CONFIG — fill in your deployed Apps Script Web App URL
// ============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwSLgrm424r3kD_WHk9rft4yPCMECa2ZaK6CaMSjL-HbpjVY8M6QqJDyA8kvEzO1g8l/exec';

// ============================================================
// API HELPER
// Sends application/x-www-form-urlencoded POST requests, which
// count as "simple requests" and skip the CORS preflight (OPTIONS)
// that Apps Script's doPost cannot answer.
// ============================================================
async function callApi(action, params = {}) {
  const body = new URLSearchParams({ action, ...params });

  const response = await fetch(API_URL, {
    method: 'POST',
    body: body
  });

  if (!response.ok) {
    throw new Error('Network error: ' + response.status);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

// ============================================================
// ADMIN SESSION
// Assumes admin-login.html stores these in sessionStorage after
// a successful `adminLogin` call.
// ============================================================
function getAdminSession() {
  return {
    username: sessionStorage.getItem('adminUsername'),
    adminKey: sessionStorage.getItem('adminKey')
  };
}

function requireAdminSession() {
  const session = getAdminSession();
  if (!session.adminKey) {
    window.location.href = 'admin-login.html';
    return null;
  }
  return session;
}

// ============================================================
// STUDENT TABLE STATE
// ============================================================
let allStudents = [];
const tableBody = document.getElementById('tableBody');
const searchInput = document.querySelector('.search-input');
const refreshBtn = document.getElementById('refreshBtn');

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function renderRows(students) {
  if (!students.length) {
    tableBody.innerHTML =
      '<tr class="empty-row"><td colspan="9">No students found.</td></tr>';
    return;
  }

  tableBody.innerHTML = students.map(function(s) {
    return (
      '<tr>' +
        '<td>' + escapeHtml(s.studentId) + '</td>' +
        '<td>' + escapeHtml(s.name) + '</td>' +
        '<td>' + escapeHtml(s.gender) + '</td>' +
        '<td>' + escapeHtml(s.course) + '</td>' +
        '<td>' + escapeHtml(s.year) + '</td>' +
        '<td>' + escapeHtml(s.homeLocation) + '</td>' +
        '<td>' + escapeHtml(s.roomType) + '</td>' +
        '<td><span class="status-badge status-' +
          escapeHtml((s.status || '').toLowerCase().replace(/\s+/g, '-')) +
          '">' + escapeHtml(s.status) + '</span></td>' +
        '<td>' + escapeHtml(s.room) + '</td>' +
      '</tr>'
    );
  }).join('');
}

function showLoadingRow() {
  tableBody.innerHTML =
    '<tr class="loading-row"><td colspan="9">Loading students…</td></tr>';
}

function showErrorRow(message) {
  tableBody.innerHTML =
    '<tr class="error-row"><td colspan="9">' + escapeHtml(message) + '</td></tr>';
}

// ============================================================
// FETCH + RENDER
// ============================================================
async function loadStudents() {
  const session = requireAdminSession();
  if (!session) return;

  showLoadingRow();

  try {
    const data = await callApi('getAllStudents', { adminKey: session.adminKey });
    allStudents = data.students || [];
    applyFilter(searchInput.value);
  } catch (err) {
    console.error(err);
    showErrorRow(err.message || 'Something went wrong.');
  }
}

function applyFilter(query) {
  const q = query.trim().toLowerCase();

  if (!q) {
    renderRows(allStudents);
    return;
  }

  const filtered = allStudents.filter(function(s) {
    return (
      String(s.name || '').toLowerCase().includes(q) ||
      String(s.studentId || '').toLowerCase().includes(q) ||
      String(s.email || '').toLowerCase().includes(q)
    );
  });

  renderRows(filtered);
}

// ============================================================
// EVENT WIRING
// ============================================================
refreshBtn.addEventListener('click', loadStudents);

searchInput.addEventListener('input', function() {
  applyFilter(searchInput.value);
});

document.addEventListener('DOMContentLoaded', loadStudents);
// In case the script runs after DOMContentLoaded already fired:
if (document.readyState !== 'loading') {
  loadStudents();
}

// --- Theme toggle ---
const THEME_KEY = 'admin-dashboard-theme';
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="var(--moon-fill)"/>';
const sunIcon = '<circle cx="12" cy="12" r="4.5" fill="var(--moon-fill)"/>' +
  '<g stroke="var(--moon-fill)" stroke-width="1.8" stroke-linecap="round">' +
  '<line x1="12" y1="1.5" x2="12" y2="4"/>' +
  '<line x1="12" y1="20" x2="12" y2="22.5"/>' +
  '<line x1="1.5" y1="12" x2="4" y2="12"/>' +
  '<line x1="20" y1="12" x2="22.5" y2="12"/>' +
  '<line x1="4.2" y1="4.2" x2="6" y2="6"/>' +
  '<line x1="18" y1="18" x2="19.8" y2="19.8"/>' +
  '<line x1="4.2" y1="19.8" x2="6" y2="18"/>' +
  '<line x1="18" y1="6" x2="19.8" y2="4.2"/>' +
  '</g>';
function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? moonIcon : sunIcon;
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  localStorage.setItem(THEME_KEY, theme);
}
const savedTheme = localStorage.getItem(THEME_KEY);
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(savedTheme || (systemPrefersLight ? 'light' : 'dark'));
themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// --- Account dropdown ---
const accountBtn = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');
function closeDropdown() {
  accountDropdown.classList.remove('open');
  accountBtn.setAttribute('aria-expanded', 'false');
}
function openDropdown() {
  accountDropdown.classList.add('open');
  accountBtn.setAttribute('aria-expanded', 'true');
}
accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = accountDropdown.classList.contains('open');
  isOpen ? closeDropdown() : openDropdown();
});
document.addEventListener('click', (e) => {
  if (!accountDropdown.contains(e.target) && e.target !== accountBtn) {
    closeDropdown();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDropdown();
});
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('adminKey');
  sessionStorage.removeItem('adminUsername');
  window.location.href = 'admin-login.html';
});

// --- Admin ID ---
function setAdminId(id) {
  document.getElementById('accountId').textContent = id ? `ID: ${id}` : 'ID: —';
}
{
  const session = getAdminSession();
  if (session.username) {
    setAdminId(session.username);
  }
}
// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

const sidebarItems = document.querySelectorAll('.sidebar-item');

const studentsSection = document.getElementById('studentsSection');
const allocationSection = document.getElementById('allocationSection');


function switchSection(section) {

  sidebarItems.forEach(function(item) {
    item.classList.toggle(
      'active',
      item.dataset.section === section
    );
  });


  studentsSection.classList.toggle(
    'active',
    section === 'students'
  );


  allocationSection.classList.toggle(
    'active',
    section === 'allocation'
  );


  // Close mobile sidebar
  if (window.innerWidth <= 1100) {
    sidebar.classList.remove('open');
  }


  if (section === 'allocation') {
    loadAllocation();
  }
}


sidebarItems.forEach(function(item) {

  item.addEventListener('click', function() {

    switchSection(item.dataset.section);

  });

});


sidebarToggle.addEventListener('click', function() {

  sidebar.classList.toggle('open');

});


// ============================================================
// ALLOCATION STATE
// ============================================================

let allocationStudents = [];
let allocationEditMode = false;
let draggedRowIndex = null;


// ============================================================
// LOAD ALLOCATION
// ============================================================

async function loadAllocation() {

  const session = requireAdminSession();

  if (!session) return;


  const tbody = document.getElementById('allocationTableBody');

  tbody.innerHTML =
    '<tr class="loading-row">' +
      '<td colspan="10">Loading students…</td>' +
    '</tr>';


  try {

    /*
     * For now this uses the same student list already loaded
     * by getAllStudents.
     *
     * Later we can replace this with a dedicated
     * getAllocationList API action.
     */

    if (!allStudents.length) {

      const data = await callApi(
        'getAllStudents',
        {
          adminKey: session.adminKey
        }
      );

      allStudents = data.students || [];

    }


    allocationStudents = [...allStudents];

    renderAllocationRows(allocationStudents);

  } catch (err) {

    console.error(err);

    tbody.innerHTML =
      '<tr class="error-row">' +
        '<td colspan="10">' +
          escapeHtml(
            err.message || 'Something went wrong.'
          ) +
        '</td>' +
      '</tr>';

  }

}


// ============================================================
// RENDER ALLOCATION ROWS
// ============================================================

function renderAllocationRows(students) {

  const tbody =
    document.getElementById('allocationTableBody');


  if (!students.length) {

    tbody.innerHTML =
      '<tr class="empty-row">' +
        '<td colspan="10">No registrations match.</td>' +
      '</tr>';

    return;

  }


  tbody.innerHTML = students.map(function(s, index) {

    return (

      '<tr class="draggable-row" ' +
          'draggable="' + allocationEditMode + '" ' +
          'data-index="' + index + '">' +

        '<td>' +

          '<span class="drag-handle">' +
            '⋮⋮' +
          '</span>' +

          '<span class="priority-number">' +
            (index + 1) +
          '</span>' +

        '</td>' +

        '<td>' +
          escapeHtml(s.studentId) +
        '</td>' +

        '<td>' +
          escapeHtml(s.name) +
        '</td>' +

        '<td>' +
          escapeHtml(s.gender) +
        '</td>' +

        '<td>' +
          escapeHtml(s.course) +
        '</td>' +

        '<td>' +
          escapeHtml(s.year) +
        '</td>' +

        '<td>' +
          escapeHtml(s.homeLocation) +
        '</td>' +

        '<td>' +
          escapeHtml(s.roomType) +
        '</td>' +

        '<td>' +

          '<span class="status-badge status-' +

            escapeHtml(
              (s.status || '')
                .toLowerCase()
                .replace(/\s+/g, '-')
            ) +

          '">' +

            escapeHtml(s.status) +

          '</span>' +

        '</td>' +

        '<td>' +
          escapeHtml(s.room) +
        '</td>' +

      '</tr>'

    );

  }).join('');


  attachDragEvents();

}


// ============================================================
// DRAG & DROP
// ============================================================

function attachDragEvents() {

  const rows =
    document.querySelectorAll(
      '#allocationTableBody .draggable-row'
    );


  rows.forEach(function(row) {

    row.addEventListener('dragstart', function() {

      if (!allocationEditMode) return;

      draggedRowIndex =
        Number(row.dataset.index);

      row.classList.add('dragging');

    });


    row.addEventListener('dragend', function() {

      row.classList.remove('dragging');

      document
        .querySelectorAll('.drag-over')
        .forEach(function(r) {

          r.classList.remove('drag-over');

        });

    });


    row.addEventListener('dragover', function(e) {

      if (!allocationEditMode) return;

      e.preventDefault();

      row.classList.add('drag-over');

    });


    row.addEventListener('dragleave', function() {

      row.classList.remove('drag-over');

    });


    row.addEventListener('drop', function(e) {

      if (!allocationEditMode) return;

      e.preventDefault();

      row.classList.remove('drag-over');


      const targetIndex =
        Number(row.dataset.index);


      if (
        draggedRowIndex === null ||
        draggedRowIndex === targetIndex
      ) {
        return;
      }


      const movedStudent =
        allocationStudents.splice(
          draggedRowIndex,
          1
        )[0];


      allocationStudents.splice(
        targetIndex,
        0,
        movedStudent
      );


      renderAllocationRows(
        allocationStudents
      );

    });

  });

}


// ============================================================
// EDIT PRIORITY
// ============================================================

document
  .getElementById('editPriorityBtn')
  .addEventListener('click', function() {

    allocationEditMode =
      !allocationEditMode;


    this.textContent =
      allocationEditMode
        ? 'Save Priority'
        : 'Edit Priority';


    renderAllocationRows(
      allocationStudents
    );


    if (!allocationEditMode) {

      /*
       * This is where the final priority order
       * can be sent to Apps Script.
       *
       * Example later:
       *
       * callApi('savePriority', {
       *   adminKey: session.adminKey,
       *   priority: JSON.stringify(...)
       * });
       */

      console.log(
        'Priority order:',
        allocationStudents
      );

    }

  });


// ============================================================
// ALLOCATION SEARCH
// ============================================================

document
  .getElementById('allocationSearch')
  .addEventListener('input', function() {

    const query =
      this.value.trim().toLowerCase();


    if (!query) {

      renderAllocationRows(
        allocationStudents
      );

      return;

    }


    const filtered =
      allocationStudents.filter(function(s) {

        return (

          String(s.name || '')
            .toLowerCase()
            .includes(query)

          ||

          String(s.studentId || '')
            .toLowerCase()
            .includes(query)

          ||

          String(s.email || '')
            .toLowerCase()
            .includes(query)

        );

      });


    renderAllocationRows(filtered);

  });


// ============================================================
// ALLOCATION REFRESH
// ============================================================

document
  .getElementById('allocationRefreshBtn')
  .addEventListener(
    'click',
    loadAllocation
  );


// ============================================================
// ALLOCATE ALL
// ============================================================

document
  .getElementById('allocateAllBtn')
  .addEventListener('click', async function() {

    const session = requireAdminSession();

    if (!session) return;


    const confirmed = confirm(
      'Are you sure you want to allocate all students?'
    );


    if (!confirmed) return;


    /*
     * Backend connection should go here.
     *
     * We don't want to invent your Apps Script
     * allocation action until we see your backend code.
     */

    alert(
      'Allocation action is ready for backend connection.'
    );

  });
