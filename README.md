# Cinema Booking
##### Web service to order/rent tickets in a cinema

## NPM and MongoDB installation/configuration

Before cloning this repository, you need to have Node.js and NPM installed, here are some snippets:

* Please check out this **[link](https://nodejs.org/en/)** to install **Node.js** and **NPM**.
* To install and configure MongoDB, check out its **[official documentation](https://docs.mongodb.com/manual/installation/)** (please note that to properly run MongoDB and access Mongo Shell - you need to configure MongoDB to run as a system service).

## Cloning repository

Make sure you have the git utility installed on your computer. Check out **[this](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)** article on how to set it up.

Here are the steps on how to clone and configure the repository:

* Cloning repository:

  ```bash
  git clone https://github.com/B0ySetsF1re/Cinema_Booking.git
  ```
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

## Finally

The **git** utility should allow you to run node and npm from it's shell, so give it a try. :)
