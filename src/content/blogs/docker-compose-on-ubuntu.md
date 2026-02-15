---
title: "Simple Docker Compose Setup on Linux"
pubDate: 2026-02-15
description: "A simple way to set up Docker and Docker Compose on Linux without needing full Docker Desktop installation"
author: "Bryce Stabenow"
image:
  url: "../../assets/docker-install-linux.jpg"
  alt: "Tux, the Linux mascot, hitting the Docker whale mascot with a wrench"
tags: ['vps', 'docker', 'linux', 'ubuntu', 'installs', 'tips']
---
# A Simple Docker Compose Install for Ubuntu

<br />

One of the most annoying things about a new VPS setup is trying to get your Docker Compose scripts to run nicely on the base Ubuntu installation. Here's some quick instructions for the most painless way to get this install finished

<br />

## Install Docker

First, get everything up to date and install these necessary tools:

``` bash
sudo apt update
sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

<br>


Next, import the repository’s GPG key using the following curl command:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

<br>

And add the Docker APT repository to your system:
```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

<br>

Finally, to install the latest version of Docker, run the commands below:
```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io git
```

<br>

Once the installation is completed, the Docker service will start automatically. You can verify it by typing:
```bash
sudo systemctl status docker
```

<br>

<br>

## Install Docker Compose

Run this command to download the current stable release of Docker Compose:
```bash
sudo apt-get install docker-compose-plugin
```

<br>

After this, you should be ready to run `docker compose up` and have your project ready to go.

<br>

Until next time, peace.