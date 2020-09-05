# Cinema Booking
##### Web service to order/rent tickets in a cinema

## NPM and MongoDB installation/configuration

Before cloning this repository, you need to have Node.js and NPM installed, here are some snippets:

* Please check out this **[link](https://nodejs.org/en/)** to install **Node.js** and **NPM**.
* To install and configure MongoDB, check out its **[official documentation](https://docs.mongodb.com/manual/installation/)** (please note that to properly run MongoDB and access Mongo Shell - you need to configure MongoDB to run as a system service).

## Cloning the repository

Make sure you have the git utility installed on your computer. Check out **[this](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)** article on how to set it up.

Here are the steps on how to clone and configure the repository:

* Cloning repository:

  ```bash
  git clone https://github.com/B0ySetsF1re/Cinema_Booking.git
  ```
* Then in the terminal navigate to the project's folder using **CD** command to install dependencies etc.

* Installing dependencies

  ```bash
  npm install
  ```
* Running the web app

  ```bash
  node app.js
  ```
You can also use **[nodemon](https://www.npmjs.com/package/nodemon)** package, so that you wouldn't need to manually restart the server each time you apply some changes.

* If you would like to install additional package/dependency for the app, you can do it as following:

  ```bash
  npm install <package_name> --save
  ```

## How to get Admin role?
As of now there is no way to obtain this role via UI ***(the dashboard actually has the web form allowing to register a user with any preferred role, however you already need to have Admin or Manager role to at least get into the dashboard).*** In order to get Admin/Manager role, you have to find the ```/users/dashboard/users-management``` route, the code of which is located here: ```./routes/users.js```. Here is the example:

```javascript
router.get('/dashboard/users-management', [userController.ensureAuthenticated, userController.isManagerOrAdmin], function(req, res) {
  res.render('dashboard_users', {
    title: 'Dashboard - Users'
  });
});
```

Here you should look for ``` [userController.ensureAuthenticated, userController.isManagerOrAdmin]```. Those are callbacks being put into the array, you can comment it with ```/* */```, which then allow you to enter the dashboard's user section and create a user with preferred role using the web form mentioned before.

In the near future there will be a rule for all dashboard routes, which will check the authentication and the role of a user.

## Finally

If you're under Windows, then **git** utility should allow you to run node and npm commands (packages) from its shell, so give it a try. :)
