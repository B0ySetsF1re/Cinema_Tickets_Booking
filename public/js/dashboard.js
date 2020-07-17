function getRegFormContent {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200) {
      document.getElementById('add').innerHTML = xhttp.responseText;
    }
  }

  xhttp.open('GET', 'RegForm', true);
}

window.onlod = function() {
  getRegFormContent();
}
