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
