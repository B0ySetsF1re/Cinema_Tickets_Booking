function getRegFormContent() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200) {
      let doc = xhttp.responseXML.getElementById('regFormContent');
      //doc.action = '/users/dashboard';
      doc.getElementsByTagName('label')[6].remove();

      let submitSection = doc.getElementsByTagName('div')[13];
      submitSection.className = 'col-sm-3';
      submitSection.firstElementChild.className = 'btn btn-lg btn-danger col-sm-12';

      document.getElementById('add').innerHTML = '<div class="container-fluid"><div class=row><div class="col-sm-6"'
      + doc.outerHTML + '</div></div></div>'; // parsing our doc into the string type and including it into our dasboard page
    }
  }

  xhttp.open('GET', '/users/register', true); // Performing XHTTP req with GET method
  xhttp.responseType = 'document'; // setting response type as document (HTML) => XMLHttpRequest supports HTML parsing on fly, so we could select specific elements more dynamicaly
  xhttp.send(); // Sending content to the dashboard page
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
        $('#deleteUsersErrorModal').modal('show');
      }
    } else if(selectVal == 'Change role') {
      console.log('Selected "' + selectVal + '" action...');
    } else if(selectval == 'Export') {
      console.log('Selected "' + selectVal + '" action...');
    } else {
      console.log('Selected "' + selectVal + '" action...');
    }
  });

}

window.onload = function() {
  let manageTabForm = document.getElementById('manageTabForm');

  (manageTabForm != null) ? manageTabForm.addEventListener('submit', checkManageTabAction, false) : '';
}
