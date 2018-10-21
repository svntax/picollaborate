# Picollaborate

A clone of Reddit's 2017 April Fools project "Place".

## Setup

This project relies on the following tech stack:

* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Socket.io](http://socket.io)
* [Redis](https://redis.io/)

### Installing

Download [Node.js](https://nodejs.org/en/) v8.XX.X or higher and verify the installation.

```
node --version

// v8.11.3
```

Clone this repository and cd into the root folder.

```
git clone https://github.com/svntax/picollaborate.git
cd picollaborate
```

Install dependencies using npm.

```
npm install
```

Install [Redis](https://redis.io/) 4.0 or higher. Note that this project was developed on an Ubuntu 18.04 machine.

## Running

In the root folder, run the following:

```
node server.js
```

and visit http://localhost:3000

## Deployment

[PM2](http://pm2.keymetrics.io/) was used to deploy the project. After installing, cd into the root folder and run the following:

```
pm2 start server.js
```
