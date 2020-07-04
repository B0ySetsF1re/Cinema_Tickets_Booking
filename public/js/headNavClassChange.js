window.onload = function() {
  // Getting current URL location
  var currentURL = window.location.href;

  // Creating object and getting DOM elements by ID
  var pages = {
    home_pg: document.getElementById('home_pg'),
    food_and_drinks_pg: document.getElementById('food_and_drinks_pg'),
    about_pg: document.getElementById('about_pg')
  }

  // Using regulare expression to remove everyhing including the first '/' symbol
  currentURL = currentURL.replace(/.*\//, '');

  // Chaecking what is the current URL location and then changing the element's class
  if(currentURL == '')
    pages.home_pg.className = 'nav-link active';
  else if(currentURL == 'food_and_drinks')
    pages.food_and_drinks_pg.className = 'nav-link active';
  else if (currentURL == 'about')
    pages.about_pg.className = 'nav-link active';
}
