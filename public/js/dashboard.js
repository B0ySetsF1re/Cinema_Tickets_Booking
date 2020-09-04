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

  $(document).ready(function() {
    $('#changeRolesModal').modal('show');
  });
}
