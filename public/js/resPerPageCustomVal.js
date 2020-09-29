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

export { setResPerPage };
