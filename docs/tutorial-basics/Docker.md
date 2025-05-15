---
sidebar_position: 3
---

# Docker

## Documentación de la creación de los docker-compose


Se deben crear directorios para cada servicio docker

Los pasos de crear las carpetas data y filebrowser, crear la base de datos y el usuario y contraseña se debe realizar con cada servicio.

### Creacion del docker-compose de HTML 

Crear una carpeta llamada docker-estatico


```md title="Crear estas carpetas"
mkdir -p filebrowser_data
mkdir -p data
```



```md title="Creamos una base de datos en filebrowser"
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```



``` md title="Creamos el usuario admin y la contraseña admin123"
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```



``` md title="Crear un archivo llamado docker-compose.yml con el siguiente contenido"
services:
  httpd:
    image: httpd:latest
    ports:
      - "8080:80"
    volumes:
      - ./data:/usr/local/apache2/htdocs/
    restart: always

  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./data:/srv
    command: --database /database.db
    restart: always

```

### Creacion del docker-compose de php 

Crear un directorio llamado docker-php

Hacer lo mismo que como en HTML pero con un diferente contenido en el yml :

```
services:
  php-apache:
    image: php:8.3-apache
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html
    restart: always

  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./data:/srv
    command: --database /database.db
    restart: always
```

### Creación del compose del laravel


Lo mismo que en los anteriores hasta el yml cuyo contenido es :

``` 
services:
  laravel:
    image: php:8.3-cli
    container_name: laravel
    working_dir: /var/www
    volumes:
      - ./laravel:/var/www
    ports:
      - "8000:8000"
    command: php artisan serve --host=0.0.0.0 --port=8000
    restart: always

  composer:
    image: composer:latest
    container_name: composer
    working_dir: /var/www
    volumes:
      - ./laravel:/var/www
    command: composer install
    depends_on:
      - laravel

  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./laravel:/srv
    command: --database /database.db
    restart: always

```

Una vez hecho el archivo docker-compose.yml ejecutar el siguiente comando :
```

docker run --rm -v $(pwd)/laravel:/app composer create-project laravel/laravel .
```

### Creación del Docker de wordpress

Creamos un directorio docker-wordpress


```md  title="Lo mismo que en los anteriores con el contenido del yml así"
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8082:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./wordpress:/var/www/html
    restart: always
    depends_on:
      - db
```
-------
```
  db:
    image: mariadb:latest
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db_data:/var/lib/mysql
    restart: always
```
-------

```
  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./wordpress:/srv
    command: --database /database.db
    restart: always
```
volumes:
  db_data:

Creamos un directorio para cuando instalemos el wordpress

mkdir wordpress



### Creación del Docker de react-vite

Creamos la carpeta docker-react

Lo mismo que en los anteriores hasta el yml, el contenido es :

services:
  react-vite:
    image: node:18
    container_name: react-vite
    working_dir: /app
    volumes:
      - ./react:/app
    ports:
      - "5173:5173"
    command: sh -c "npm install && npm run dev -- --host"
    restart: always

  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./react:/srv
    command: --database /database.db
    restart: always

Crear una carpeta llamada react

mkdir react

Con este comando generamos un `projecto vite` dentro de la carpeta :
```
docker run -it --rm -v $(pwd)/react:/app -w /app node:18 bash -c "npm create vite@latest . -- --template react && npm install"
```





### Create your first Post

Create a file at `blog/2021-02-28-greetings.md`:

```md title="blog/2021-02-28-greetings.md"
---
slug: greetings
title: Greetings!
authors:
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
  - name: Sébastien Lorber
    title: Docusaurus maintainer
    url: https://sebastienlorber.com
    image_url: https://github.com/slorber.png
tags: [greetings]
---

Congratulations, you have made your first post!

Feel free to play around and edit this post as much as you like.
```

A new blog post is now available at [http://localhost:3000/blog/greetings](http://localhost:3000/blog/greetings).
