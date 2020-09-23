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

async function manageTabSelectNewRoles() {
  await new Promise(resolve => {
    $(document).ready(async () => {
      if(document.getElementById('changeRolesFrmGrp').childElementCount > 1) {
        $('#changeRolesFrmGrpTitle').nextAll().remove();
      }

      let selectedUsers = getSelectedUsers();

      await selectedUsers.forEach(async (userGroups, i) => {
          $('#changeRolesFrmGrp').append('<div id="changeRolesFrmGrpUsers' + (i + 1) + '" class="form-inline d-flex justify-content-between pb-1 pt-1"></div>');

          await userGroups.forEach(async (user, j) => {
            if(j == 0) {
              $('#changeRolesFrmGrpUsers' + (i + 1)).append('<input name="id" value="' + user + '" class="d-none">');
            } else if(j == 5) {
              $('#changeRolesFrmGrpUsers' + (i + 1)).append('<select class="custom-select my-1 mr-sm-4 ml-sm-4" name="roles"></select>');
              $('#changeRolesFrmGrpUsers' + (i + 1) + ' select').append('<option selected>Choose...</option>')

              for(let k = 0; k < 3; k++) {
                switch(k) {
                  case 0: $('#changeRolesFrmGrpUsers' + (i + 1) + ' select').append('<option value="basic">Basic</option>'); break;
                  case 1: $('#changeRolesFrmGrpUsers' + (i + 1) + ' select').append('<option value="manager">Manager</option>'); break;
                  case 2: $('#changeRolesFrmGrpUsers' + (i + 1) + ' select').append('<option value="admin">Administrator</option>'); break;
                }
              }
            } else {
              $('#changeRolesFrmGrpUsers' + (i + 1)).append('<label class="my-1 mr-4 ml-4">' + user + '</label>');
            }
            if((i + 1) % 2 != 0) {
              $('#changeRolesFrmGrpUsers' + (i + 1)).addClass('table-row-darker');
            }
          });
      });

      resolve();
    });
  });
}

function roleOptionsValid() {
  let formGroupChilds = document.getElementById('changeRolesFrmGrp').getElementsByTagName('div');

  for(let i = 0; i < formGroupChilds.length; i++) {
    if(formGroupChilds[i].lastElementChild.value == 'Choose...') {
      return false;
    }
  }

  return true;
}

async function checkIfUserExists() {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        if(!xhr.response.error) {
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      }
    }

    xhr.onerror = function() {
      reject(new Error('An error occurred during the transaction'));
    }

    xhr.open('POST', '/users/dashboard/users-management/API/checkIfUserExists', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.responseType = 'json';
    xhr.send(JSON.stringify({
      ids: new FormData(document.getElementById('changeRolesBodyForm')).getAll('id')
    }));
  }).then(
    success => {
      return success;
    },
    error => {
      return error;
    }
  );
}

async function validateChangeRoleModal() {
  let msg = document.getElementById('msg');

  if(!roleOptionsValid()) {
    msg.className = 'alert alert-danger ml-3 mr-3';
    msg.innerHTML = 'One or more roles haven\'t been changed!';
  } else {
    const usersExist = await checkIfUserExists();

    if(usersExist.error) {
      msg.className = 'alert alert-danger ml-3 mr-3';
      msg.innerHTML = usersExist.message;
    } else {
      document.getElementById('changeRolesBodyForm').submit();
    }
  }
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
        $('#changeRolesModal').modal('show');

        document.getElementById('changeRolesConfirmBtn').addEventListener('click', validateChangeRoleModal, false);
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

function setResPerPage(e) {
  if(e.key == 'Enter') {
    let regExp = /^\d+$/;
    let input = document.getElementById('customResPerPage');

    if(input.value == '' || regExp.test(input.value) == false) {
      window.alert('This field can\'t be empty and should contain numbers only!');
    } else {
      let currentUrl = window.location.href;
      let pageNumExp = RegExp('[/]\\d+', 'g');

      pageNumExp.test(currentUrl);
      currentUrl = currentUrl.substring(0, pageNumExp.lastIndex);

      window.location.replace(currentUrl + '?resPerPage=' + parseInt(input.value));
    }
  }
}


window.onload = function() {
  document.getElementById('manageTabForm').addEventListener('submit', checkManageTabAction, false);
  $(document).ready(function() {
    $('#changeRolesModal').on('show.bs.modal', manageTabSelectNewRoles);
  });
  document.getElementById('customResPerPage').addEventListener('keyup', setResPerPage, false);
}
