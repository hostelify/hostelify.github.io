// ============================================================
// CONFIG
// ============================================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbwSLgrm424r3kD_WHk9rft4yPCMECa2ZaK6CaMSjL-HbpjVY8M6QqJDyA8kvEzO1g8l/exec';


// ============================================================
// API HELPER
// ============================================================

async function callApi(action, params = {}) {

  const body =
    new URLSearchParams({
      action,
      ...params
    });

  const response =
    await fetch(API_URL, {
      method: 'POST',
      body: body
    });

  if (!response.ok) {
    throw new Error(
      'Network error: ' + response.status
    );
  }

  const data =
    await response.json();

  if (!data.success) {
    throw new Error(
      data.message ||
      'Request failed.'
    );
  }

  return data;
}


// ============================================================
// ADMIN SESSION
// ============================================================

function getAdminSession() {

  return {
    username:
      sessionStorage.getItem(
        'adminUsername'
      ),

    adminKey:
      sessionStorage.getItem(
        'adminKey'
      )
  };

}


function requireAdminSession() {

  const session =
    getAdminSession();

  if (!session.adminKey) {

    window.location.href =
      'admin-login.html';

    return null;

  }

  return session;

}


// ============================================================
// STUDENT TABLE STATE
// ============================================================

let allStudents = [];

const tableBody =
  document.getElementById(
    'tableBody'
  );

const searchInput =
  document.querySelector(
    '.search-input'
  );

const refreshBtn =
  document.getElementById(
    'refreshBtn'
  );


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

  const div =
    document.createElement(
      'div'
    );

  div.textContent =
    value == null
      ? ''
      : String(value);

  return div.innerHTML;

}


// ============================================================
// STUDENT TABLE RENDER
// ============================================================

function renderRows(students) {

  if (!students.length) {

    tableBody.innerHTML =
      '<tr class="empty-row">' +
        '<td colspan="9">' +
          'No students found.' +
        '</td>' +
      '</tr>';

    return;

  }

  tableBody.innerHTML =
    students.map(function(s) {

      return (

        '<tr>' +

          '<td>' +
            escapeHtml(
              s.studentId
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.name
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.gender
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.course
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.year
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.homeLocation
            ) +
          '</td>' +

          '<td>' +
            escapeHtml(
              s.roomType
            ) +
          '</td>' +

          '<td>' +

            '<span class="status-badge status-' +

              escapeHtml(
                (s.status || '')
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    '-'
                  )
              ) +

            '">' +

              escapeHtml(
                s.status
              ) +

            '</span>' +

          '</td>' +

          '<td>' +
            escapeHtml(
              s.room
            ) +
          '</td>' +

        '</tr>'

      );

    }).join('');

}


// ============================================================
// STUDENT TABLE LOADING
// ============================================================

function showLoadingRow() {

  tableBody.innerHTML =
    '<tr class="loading-row">' +
      '<td colspan="9">' +
        'Loading students…' +
      '</td>' +
    '</tr>';

}


function showErrorRow(message) {

  tableBody.innerHTML =
    '<tr class="error-row">' +
      '<td colspan="9">' +
        escapeHtml(message) +
      '</td>' +
    '</tr>';

}


// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

  const session =
    requireAdminSession();

  if (!session) return;

  showLoadingRow();

  try {

    const data =
      await callApi(
        'getAllStudents',
        {
          adminKey:
            session.adminKey
        }
      );

    allStudents =
      Array.isArray(data.students)
        ? data.students
        : [];

    applyFilter(
      searchInput.value
    );

  } catch (err) {

    console.error(err);

    showErrorRow(
      err.message ||
      'Something went wrong.'
    );

  }

}


// ============================================================
// STUDENT SEARCH
// ============================================================

function applyFilter(query) {

  const q =
    query
      .trim()
      .toLowerCase();

  if (!q) {

    renderRows(
      allStudents
    );

    return;

  }

  const filtered =
    allStudents.filter(
      function(s) {

        return (

          String(
            s.name || ''
          )
            .toLowerCase()
            .includes(q)

          ||

          String(
            s.studentId || ''
          )
            .toLowerCase()
            .includes(q)

          ||

          String(
            s.email || ''
          )
            .toLowerCase()
            .includes(q)

        );

      }
    );

  renderRows(
    filtered
  );

}


// ============================================================
// STUDENT EVENTS
// ============================================================

refreshBtn.addEventListener(
  'click',
  loadStudents
);


searchInput.addEventListener(
  'input',
  function() {

    applyFilter(
      searchInput.value
    );

  }
);


// ============================================================
// THEME
// ============================================================

const THEME_KEY =
  'admin-dashboard-theme';

const root =
  document.documentElement;

const themeBtn =
  document.getElementById(
    'themeBtn'
  );

const themeIcon =
  document.getElementById(
    'themeIcon'
  );


const moonIcon =
  '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="var(--moon-fill)"/>';


const sunIcon =
  '<circle cx="12" cy="12" r="4.5" fill="var(--moon-fill)"/>' +

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

  root.setAttribute(
    'data-theme',
    theme
  );

  themeIcon.innerHTML =
    theme === 'dark'
      ? moonIcon
      : sunIcon;

  themeBtn.setAttribute(
    'aria-label',
    theme === 'dark'
      ? 'Switch to light theme'
      : 'Switch to dark theme'
  );

  localStorage.setItem(
    THEME_KEY,
    theme
  );

}


const savedTheme =
  localStorage.getItem(
    THEME_KEY
  );

const systemPrefersLight =
  window.matchMedia(
    '(prefers-color-scheme: light)'
  ).matches;


applyTheme(
  savedTheme ||
  (
    systemPrefersLight
      ? 'light'
      : 'dark'
  )
);


themeBtn.addEventListener(
  'click',
  function() {

    const current =
      root.getAttribute(
        'data-theme'
      );

    applyTheme(
      current === 'dark'
        ? 'light'
        : 'dark'
    );

  }
);


// ============================================================
// ACCOUNT DROPDOWN
// ============================================================

const accountBtn =
  document.getElementById(
    'accountBtn'
  );

const accountDropdown =
  document.getElementById(
    'accountDropdown'
  );


function closeDropdown() {

  accountDropdown.classList.remove(
    'open'
  );

  accountBtn.setAttribute(
    'aria-expanded',
    'false'
  );

}


function openDropdown() {

  accountDropdown.classList.add(
    'open'
  );

  accountBtn.setAttribute(
    'aria-expanded',
    'true'
  );

}


accountBtn.addEventListener(
  'click',
  function(e) {

    e.stopPropagation();

    const isOpen =
      accountDropdown.classList.contains(
        'open'
      );

    isOpen
      ? closeDropdown()
      : openDropdown();

  }
);


document.addEventListener(
  'click',
  function(e) {

    if (
      !accountDropdown.contains(
        e.target
      ) &&
      e.target !== accountBtn
    ) {

      closeDropdown();

    }

  }
);


document.addEventListener(
  'keydown',
  function(e) {

    if (e.key === 'Escape') {

      closeDropdown();

    }

  }
);


document
  .getElementById(
    'logoutBtn'
  )
  .addEventListener(
    'click',
    function() {

      sessionStorage.removeItem(
        'adminKey'
      );

      sessionStorage.removeItem(
        'adminUsername'
      );

      window.location.href =
        'admin-login.html';

    }
  );


// ============================================================
// ADMIN ID
// ============================================================

function setAdminId(id) {

  document.getElementById(
    'accountId'
  ).textContent =
    id
      ? `ID: ${id}`
      : 'ID: —';

}


{

  const session =
    getAdminSession();

  if (session.username) {

    setAdminId(
      session.username
    );

  }

}


// ============================================================
// SIDEBAR
// ============================================================

const sidebar =
  document.getElementById(
    'sidebar'
  );

const sidebarToggle =
  document.getElementById(
    'sidebarToggle'
  );

const sidebarItems =
  document.querySelectorAll(
    '.sidebar-item'
  );

const studentsSection =
  document.getElementById(
    'studentsSection'
  );

const allocationSection =
  document.getElementById(
    'allocationSection'
  );


function switchSection(
  section
) {

  sidebarItems.forEach(
    function(item) {

      item.classList.toggle(
        'active',
        item.dataset.section ===
          section
      );

    }
  );


  studentsSection.classList.toggle(
    'active',
    section === 'students'
  );


  allocationSection.classList.toggle(
    'active',
    section === 'allocation'
  );


  if (
    window.innerWidth <= 1100
  ) {

    sidebar.classList.remove(
      'open'
    );

  }


  if (
    section === 'allocation'
  ) {

    loadAllocation();

  }

}


sidebarItems.forEach(
  function(item) {

    item.addEventListener(
      'click',
      function() {

        switchSection(
          item.dataset.section
        );

      }
    );

  }
);


sidebarToggle.addEventListener(
  'click',
  function() {

    sidebar.classList.toggle(
      'open'
    );

  }
);


// ============================================================
// ALLOCATION STATE
// ============================================================
//
// IMPORTANT:
//
// allocationStudents = OFFICIAL BACKEND ORDER.
//
// visualAllocationStudents = temporary visual-only order.
//
// The visual order is NEVER sent to backend.
// ============================================================

let allocationStudents = [];

let visualAllocationStudents = [];

let allocationEditMode =
  false;

let draggedStudentId =
  null;


// ============================================================
// NORMALIZE BACKEND ALLOCATION DATA
// ============================================================
//
// IMPORTANT:
//
// This function does NOT calculate priority.
//
// It only makes sure that the frontend receives the exact
// backend field names in a consistent format.
//
// ============================================================

function normalizeAllocationStudent(student) {

  return {

    priority:
      Number(student.priority),

    studentId:
      student.studentId || '',

    name:
      student.name || '',

    email:
      student.email || '',

    gender:
      student.gender || '',

    course:
      student.course || '',

    year:
      student.year || '',

    homeLocation:
      student.homeLocation || '',

    roomType:
      student.roomType || '',

    status:
      student.status || '',

    room:
      student.room || ''

  };

}


// ============================================================
// SORT BY OFFICIAL BACKEND PRIORITY
// ============================================================
//
// VERY IMPORTANT:
//
// This is NOT a new priority calculation.
//
// The frontend does NOT calculate NCR distance,
// Outside NCR score, hostel preference, etc.
//
// It ONLY sorts using the priority number already
// calculated by the backend.
//
// Backend:
//     priority = 1
//     priority = 2
//     priority = 3
//
// Frontend:
//     1 → 2 → 3
//
// ============================================================

function sortByBackendPriority(students) {

  return students
    .slice()
    .sort(function(a, b) {

      const priorityA =
        Number(a.priority);

      const priorityB =
        Number(b.priority);


      // Valid backend priorities come first.

      const validA =
        Number.isFinite(priorityA);

      const validB =
        Number.isFinite(priorityB);


      if (
        validA &&
        validB
      ) {

        return (
          priorityA -
          priorityB
        );

      }


      if (
        validA &&
        !validB
      ) {

        return -1;

      }


      if (
        !validA &&
        validB
      ) {

        return 1;

      }


      // Should practically never happen because the backend
      // always supplies priority.

      return String(
        a.studentId || ''
      ).localeCompare(
        String(
          b.studentId || ''
        )
      );

    });

}


// ============================================================
// LOAD OFFICIAL BACKEND PRIORITY
// ============================================================

async function loadAllocation() {

  const session =
    requireAdminSession();

  if (!session) return;


  const tbody =
    document.getElementById(
      'allocationTableBody'
    );


  tbody.innerHTML =
    '<tr class="loading-row">' +
      '<td colspan="10">' +
        'Calculating priority…' +
      '</td>' +
    '</tr>';


  try {

    /*
     * ONLY the backend calculates priority.
     *
     * The frontend does not know or care whether the backend
     * used:
     *
     * - NCR
     * - Outside NCR
     * - distance
     * - 1000000
     * - any future priority rule
     *
     * It simply receives the official result.
     */

    const data =
      await callApi(
        'getAllocationPriority',
        {
          adminKey:
            session.adminKey
        }
      );


    if (
      !Array.isArray(
        data.students
      )
    ) {

      throw new Error(
        'Backend returned an invalid allocation priority list.'
      );

    }


    /*
     * Normalize ONLY field names/types.
     *
     * No priority calculation happens here.
     */

    const backendStudents =
      data.students.map(
        normalizeAllocationStudent
      );


    /*
     * CRITICAL:
     *
     * Sort using ONLY the priority number generated by
     * the backend.
     *
     * This protects the display even if the API response
     * arrives in an unexpected order.
     */

    allocationStudents =
      sortByBackendPriority(
        backendStudents
      );


    /*
     * Visual array starts from the official backend order.
     */

    visualAllocationStudents =
      allocationStudents.slice();


    allocationEditMode =
      false;


    document.getElementById(
      'editPriorityBtn'
    ).textContent =
      'Edit Priority';


    renderAllocationRows(
      allocationStudents
    );


  } catch (err) {

    console.error(err);

    tbody.innerHTML =
      '<tr class="error-row">' +
        '<td colspan="10">' +
          escapeHtml(
            err.message ||
            'Unable to load allocation priority.'
          ) +
        '</td>' +
      '</tr>';

  }

}


// ============================================================
// RENDER ALLOCATION ROWS
// ============================================================

function renderAllocationRows(
  students
) {

  const tbody =
    document.getElementById(
      'allocationTableBody'
    );


  if (!students.length) {

    tbody.innerHTML =
      '<tr class="empty-row">' +
        '<td colspan="10">' +
          'No registrations match.' +
        '</td>' +
      '</tr>';

    return;

  }


  tbody.innerHTML =
    students.map(
      function(s, index) {


        /*
         * NORMAL MODE:
         *
         * ALWAYS show the official backend priority.
         *
         * Never replace it with frontend index.
         */

        const displayedPriority =
          allocationEditMode
            ? index + 1
            : s.priority;


        return (

          '<tr class="draggable-row" ' +

            'draggable="' +
              allocationEditMode +
            '" ' +

            'data-student-id="' +
              escapeHtml(
                s.studentId
              ) +
            '">' +


            '<td>' +

              '<span class="drag-handle">' +
                '⋮⋮' +
              '</span>' +

              '<span class="priority-number">' +
                escapeHtml(
                  displayedPriority
                ) +
              '</span>' +

            '</td>' +


            '<td>' +
              escapeHtml(
                s.studentId
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.name
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.gender
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.course
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.year
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.homeLocation
              ) +
            '</td>' +


            '<td>' +
              escapeHtml(
                s.roomType
              ) +
            '</td>' +


            '<td>' +

              '<span class="status-badge status-' +

                escapeHtml(
                  (s.status || '')
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      '-'
                    )
                ) +

              '">' +

                escapeHtml(
                  s.status
                ) +

              '</span>' +

            '</td>' +


            '<td>' +
              escapeHtml(
                s.room
              ) +
            '</td>' +


          '</tr>'

        );

      }
    ).join('');


  attachDragEvents();

}


// ============================================================
// DRAG & DROP
// ============================================================
//
// STRICTLY VISUAL.
//
// The dragged order:
// - is NOT sent to backend
// - is NOT saved
// - is NOT written to Sheets
// - is NOT used by runAllocation()
//
// ============================================================

function attachDragEvents() {

  const rows =
    document.querySelectorAll(
      '#allocationTableBody .draggable-row'
    );


  rows.forEach(
    function(row) {


      row.addEventListener(
        'dragstart',
        function() {

          if (
            !allocationEditMode
          ) return;


          draggedStudentId =
            row.dataset.studentId;


          row.classList.add(
            'dragging'
          );

        }
      );


      row.addEventListener(
        'dragend',
        function() {

          row.classList.remove(
            'dragging'
          );


          document
            .querySelectorAll(
              '.drag-over'
            )
            .forEach(
              function(r) {

                r.classList.remove(
                  'drag-over'
                );

              }
            );


          draggedStudentId =
            null;

        }
      );


      row.addEventListener(
        'dragover',
        function(e) {

          if (
            !allocationEditMode
          ) return;


          e.preventDefault();


          row.classList.add(
            'drag-over'
          );

        }
      );


      row.addEventListener(
        'dragleave',
        function() {

          row.classList.remove(
            'drag-over'
          );

        }
      );


      row.addEventListener(
        'drop',
        function(e) {

          if (
            !allocationEditMode
          ) return;


          e.preventDefault();


          row.classList.remove(
            'drag-over'
          );


          const targetStudentId =
            row.dataset.studentId;


          if (
            !draggedStudentId ||
            !targetStudentId ||
            draggedStudentId ===
              targetStudentId
          ) {

            return;

          }


          const fromIndex =
            visualAllocationStudents.findIndex(
              function(student) {

                return (
                  String(
                    student.studentId
                  ) ===
                  String(
                    draggedStudentId
                  )
                );

              }
            );


          const toIndex =
            visualAllocationStudents.findIndex(
              function(student) {

                return (
                  String(
                    student.studentId
                  ) ===
                  String(
                    targetStudentId
                  )
                );

              }
            );


          if (
            fromIndex === -1 ||
            toIndex === -1
          ) {

            return;

          }


          const movedStudent =
            visualAllocationStudents.splice(
              fromIndex,
              1
            )[0];


          visualAllocationStudents.splice(
            toIndex,
            0,
            movedStudent
          );


          /*
           * ONLY visualAllocationStudents changes.
           *
           * allocationStudents remains untouched.
           *
           * Backend priority remains untouched.
           */

          renderAllocationRows(
            visualAllocationStudents
          );

        }
      );

    }
  );

}


// ============================================================
// EDIT PRIORITY
// ============================================================
//
// IMPORTANT:
//
// This does NOT save priority.
//
// "Save Priority" simply exits visual editing and restores
// the official backend order.
//
// ============================================================

document
  .getElementById(
    'editPriorityBtn'
  )
  .addEventListener(
    'click',
    async function() {


      // --------------------------------------------------------
      // ENTER VISUAL EDIT MODE
      // --------------------------------------------------------

      if (
        !allocationEditMode
      ) {

        allocationEditMode =
          true;


        visualAllocationStudents =
          allocationStudents.slice();


        this.textContent =
          'Save Priority';


        renderAllocationRows(
          visualAllocationStudents
        );


        return;

      }


      // --------------------------------------------------------
      // EXIT VISUAL EDIT MODE
      // --------------------------------------------------------

      allocationEditMode =
        false;


      this.textContent =
        'Edit Priority';


      /*
       * Discard ALL visual changes.
       *
       * Restore official backend order.
       */

      visualAllocationStudents =
        allocationStudents.slice();


      renderAllocationRows(
        allocationStudents
      );

    }
  );


// ============================================================
// ALLOCATION SEARCH
// ============================================================

document
  .getElementById(
    'allocationSearch'
  )
  .addEventListener(
    'input',
    function() {

      const query =
        this.value
          .trim()
          .toLowerCase();


      const sourceStudents =
        allocationEditMode
          ? visualAllocationStudents
          : allocationStudents;


      if (!query) {

        renderAllocationRows(
          sourceStudents
        );

        return;

      }


      const filtered =
        sourceStudents.filter(
          function(s) {

            return (

              String(
                s.name || ''
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                s.studentId || ''
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                s.email || ''
              )
                .toLowerCase()
                .includes(query)

            );

          }
        );


      renderAllocationRows(
        filtered
      );

    }
  );


// ============================================================
// ALLOCATION REFRESH
// ============================================================

document
  .getElementById(
    'allocationRefreshBtn'
  )
  .addEventListener(
    'click',
    function() {

      /*
       * Refresh ALWAYS gets a fresh official priority
       * calculation from the backend.
       */

      loadAllocation();

    }
  );


// ============================================================
// ALLOCATE ALL
// ============================================================
//
// CRITICAL:
//
// The frontend sends ONLY:
//
// - batchId
// - adminKey
//
// It NEVER sends:
//
// - priority
// - student order
// - dragged order
// - row index
// - allocationStudents
// - visualAllocationStudents
//
// Backend independently performs:
//
// getStudentsByBatch()
//        ↓
// sortStudentsForAllocation()
//        ↓
// actual allocation
//
// ============================================================

document
  .getElementById(
    'allocateAllBtn'
  )
  .addEventListener(
    'click',
    async function() {


      const session =
        requireAdminSession();

      if (!session) return;


      if (
        allocationEditMode
      ) {

        alert(
          'Please finish editing the priority list first.'
        );

        return;

      }


      const confirmed =
        confirm(
          'Are you sure you want to allocate all students?'
        );


      if (!confirmed) return;


      this.disabled =
        true;


      this.textContent =
        'Allocating…';


      try {


        // ------------------------------------------------------
        // GET CURRENT BATCH FROM BACKEND
        // ------------------------------------------------------

        const priorityData =
          await callApi(
            'getAllocationPriority',
            {
              adminKey:
                session.adminKey
            }
          );


        const batchId =
          priorityData.batchId ||
          '';


        if (!batchId) {

          throw new Error(
            'Current batch ID could not be determined.'
          );

        }


        // ------------------------------------------------------
        // ACTUAL ALLOCATION
        // ------------------------------------------------------
        //
        // Frontend priority/order is NOT sent.
        //
        // Backend recalculates everything itself.
        // ------------------------------------------------------

        const data =
          await callApi(
            'runAllocation',
            {
              batchId:
                batchId,

              adminKey:
                session.adminKey
            }
          );


        alert(
          data.message ||
          (
            'Allocation completed.\n\n' +

            'Allocated: ' +
            (
              data.allocated ||
              0
            ) +

            '\n' +

            'Not Allocated: ' +
            (
              data.notAllocated ||
              0
            )
          )
        );


        await loadStudents();

        await loadAllocation();


      } catch (err) {

        console.error(err);


        alert(
          err.message ||
          'Allocation failed.'
        );


      } finally {

        this.disabled =
          false;


        this.textContent =
          'Allocate All';

      }

    }
  );


// ============================================================
// INITIAL LOAD
// ============================================================

document.addEventListener(
  'DOMContentLoaded',
  function() {

    loadStudents();

  }
);


// In case DOMContentLoaded has already fired.

if (
  document.readyState !==
  'loading'
) {

  loadStudents();

}
