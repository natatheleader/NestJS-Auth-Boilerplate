
<div align="center">
    <p align="center">
        <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
        <img src="https://i.ibb.co/Z1fGw5c/Brand.png" width="200" alt="Redemption Logo" />
    </p>
    <h1>NestJS Full Authentication Boilerplate</h1>
    <br />
    
    This is a boilerplate prepared for NestJS users to provide full Authentication via Email, Google, Facebook and firebase Phone.
</div>


## Contents <!-- omit in toc -->

- [Some Background](#some-background)
- [Installation](#installation)
- [Routes](#routes)
- [Commands](#commands)
- [Next](#next)
- [License](#license)

<!--lint enable awesome-list-item-->

## Some Background

This project aims to provide a starting point for new projects and stop the itterative works. It uses prisma, passport and jwt. The user can swap the database easily via the configration file and start using it. every thing is prepared to make it easy to use and configure it as needed. Enjoy, Use, Contribute and update.


## Installation
First make sure that you install NestJs. then Clone the project to the desired directory

```bash
git clone https://github.com/natatheleader/NestJS-Auth-Boilerplate.git
```

after cloaning the project run this command.

```bash
npm install 
```

This will install all the dependancies and node modules. once you dounloaded all the modules the project is now ready to start using. but to start using you need to setup your databse.

```bash
cp .env.test .env
```

this will copy and paste the .env file into your directory and then you can setup all the variables to make your project work. all the variables are disscussed in detail bellow:

```config
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=

# mail
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

# optional
# MAIL_TRANSPORT=smtp://${MAIL_USER}:${MAIL_PASSWORD}@${MAIL_HOST}

#Google
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
GOOGLE_CALLBACK_URL=

#Facebook
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_APP_URL=
```

#### DATABSE_URL
Set the url of your database here. it looks someting like this:
```config
DATABASE_URL="postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName"
```

#### JWT_SECRET
Set the JWT secret here. this here is used by JWT to encript and verify tokens generated by the system. make sure this is secrete and a good one so your system is secure.
```config
JWT_SECRET="some secrete word here"
```

#### JWT_REFRESH_SECRET
Set the JWT referesh secret here. this here is used by JWT to encript and verify refresh tokens generated by the system. make sure this is secrete and a good one so your system is secure.
```config
JWT_REFRESH_SECRET="some secrete word here"
```

#### MAIL_HOST
Set this variable to the email provider _**host**_ you use to send emails generated by the system. for example if you use Google
```config
MAIL_HOST=smtp.gmail.com
```

#### MAIL_HOST
Set this variable to the email provider _**port**_ you use to send emails generated by the system. for example if you use Google
```config
MAIL_PORT=465
```

#### MAIL_USER
Set this variable to the email _**address**_ you use to send emails generated by the system.
```config
MAIL_USER=yourEmail@host.com
```

#### MAIL_PASSWORD
Set this variable to the email _**password**_ you use to send emails generated by the system. In the case of gmail use password generated by google for other system use.
```config
MAIL_PASSWORD=password
```

#### MAIL_FROM
Set this variable to the email _**address**_ that you want users to see as the sender for emails generated by the system.
```config
MAIL_FROM=email@address.com
```

#### GOOGLE
For using google Auth _**Google Client ID**_, _**Google secret**_ and _**Callback link**_ is necessary. To get these go to [Google API Console](https://console.cloud.google.com/welcome) or use the Guide that you can found [Here](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)

```config
GOOGLE_CLIENT_ID=your id here
GOOGLE_SECRET=your secret here
GOOGLE_CALLBACK_URL=your callback link here
```

#### FACEBOOK
For using facebook Auth _**Facebook App ID**_, _**Facebook App secret**_ and _**Facebook App link**_ is necessary. To get these go to [Facebook for Developers](https://developers.facebook.com) or use the Guide that you can found [Here](https://webkul.com/blog/how-to-generate-facebook-app-id/)

```config
FACEBOOK_APP_ID=your id here
FACEBOOK_APP_SECRET=your secret here
FACEBOOK_APP_URL=your app link here
```

After setting up the databse connections and other necessary variables the system can now is ready for use.

For Firebase create a folder with the name _**firebase**_ inside 

```folder
src/auth/
```

then paste the config JSON that you get after registering and setting up firebase for the app.

## Routes


## License

[MIT](LICENSE)
