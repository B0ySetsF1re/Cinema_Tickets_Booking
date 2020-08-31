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

function checkManageTabAction(e) {
  e.preventDefault();
}

function manageConfirmRemove() {
 /* TBD */
}

function manageSelectNewRoles() {
  /* TBD */
}

window.onload = function() {

}
