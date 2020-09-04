function selectedUsersCount() {
  let usersTable = document.getElementById('manageTabUsersTable').lastElementChild;
  let count = 0;

  for(let i = 0; i < usersTable.rows.length; i++) {
    if(usersTable.rows[i].cells[0].firstElementChild.checked) {
      count++;
    }
  }

  return count;
}

function getSelectedUsers() {
  let usersTable = document.getElementById('manageTabUsersTable').lastElementChild;
  let selectedUsers = new Array(selectedUsersCount());
  let i = 0;

  for(let j = 0; j < usersTable.rows.length; j++) {
    if(usersTable.rows[j].cells[0].firstElementChild.checked) {
      selectedUsers[i] = new Array(usersTable.rows[j].cells.length - 1);
      for(let k = 0; k < usersTable.rows[j].cells.length; k++) {
        if(k == 0) {
          selectedUsers[i][k] = usersTable.rows[j].cells[k].firstElementChild.value;
        } else if(k != 1){
          selectedUsers[i][k - 1] = usersTable.rows[j].cells[k].textContent;
        }
      }
      i++;
    }
  }

  return selectedUsers;
}

function usersSelected() {
  let usersTable = document.getElementById('manageTabUsersTable');

  for(let i = 1; i < usersTable.rows.length; i++) {
    if(usersTable.rows.item(i).getElementsByTagName('input')[0].checked) {
      return true;
    }
  }

  return false;
}

function manageTabSelectNewRoles() {
  /* TBD */
}

function checkManageTabAction(e) {
  e.preventDefault();
  let selectVal = document.getElementById('manageTabFormSelect').value;
  let manageTabForm = document.getElementById('manageTabForm');

  $(document).ready(function() {
    if(selectVal == 'Select action...') {
      $('#selectActionErrorModal').modal('show');
    } else if(selectVal == 'Delete') {
      if(usersSelected()) {
        $('#deleteUsersModal').modal('show');

        document.getElementById('deleteUsersModalConfirmBtn').addEventListener('click',
        () => { manageTabForm.submit(); }, false);
      } else {
        $('#selectUsersErrorModal').modal('show');
      }
    } else if(selectVal == 'Change role') {
      if(usersSelected()) {
        console.log('Selected "' + selectVal + '" action...')
        console.log(getSelectedUsers());
        $('#changeRolesModal').modal('show');
      }
      else {
        $('#selectUsersErrorModal').modal('show');
      }
    } else if(selectVal == 'Export all data') {
      console.log('Selected "' + selectVal + '" action...');
    } else {
      console.log('Selected "' + selectVal + '" action...');
    }
  });

}

window.onload = function() {
  let manageTabForm = document.getElementById('manageTabForm');

  (manageTabForm != null) ? manageTabForm.addEventListener('submit', checkManageTabAction, false) : '';

  /*$(document).ready(function() {
    $('#changeRolesModal').modal('show');
  });*/
}
