---
sidebar_position: 3
---

# Docker

## Documentación de la creación de los Docker-Compose


### Estructura general

Para cada servicio en Docker se deben crear directorios independientes. En cada uno de ellos, se deben seguir los siguientes pasos:

1. Crear las carpetas `data` y `filebrowser_data`.
2. Inicializar la base de datos para FileBrowser.
3. Crear el usuario `admin` con la contraseña `admin123`.

---

### Creacion del docker-compose de HTML 

Para comezar con la creación del Docker-Compose de HTML haremos un directorio raiz llamado `docker-estatico`.

```md 
mkdir -p docker-estastico
```
Una vez creado, nos moveremos con `cd` a nuestro directorio raiz, dentro de`\docker-compose` añadiremos los siguientes subdiretorios.

```md 
mkdir -p filebrowser_data
mkdir -p data
```

Continuamos con la creación de una base de datos en filebrowser.

```md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

Ya creada la base de datos, pasaremos con el administrador encargado de la base de datos, al ser una guia de ejemplo usaremos como usuario `admin` y contraseña `admin123`.

``` md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```

Creamos un archivo llamado `docker-compose.yml` con el siguiente contenido para definir y configurar todos los servicios, redes y base de datos que se necesita.

``` md 
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
---
### Creacion del docker-compose de php 

Para comezar con la creación del Docker-Compose de php haremos un directorio raiz llamado `docker-php`.
```
mkdir -p docker-php
```
Una vez creado, nos moveremos con `cd` a nuestro directorio raiz, dentro de`\docker-php` añadiremos los siguientes subdiretorios.

```md 
mkdir -p filebrowser_data
mkdir -p data
```

Continuamos con la creación de una base de datos en filebrowser.

```md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

Ya creada la base de datos, pasaremos con el administrador encargado de la base de datos, al ser una guia de ejemplo usaremos como usuario `admin` y contraseña `admin123`.

``` md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```
Creamos un archivo llamado `docker-compose.yml` con el siguiente contenido para definir y configurar todos los servicios, redes y base de datos que se necesita.
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
---
### Creación del compose de Laravel


Para comezar con la creación del Docker-Compose de Laravel haremos un directorio raiz llamado `docker-laravel`.

```md 
mkdir -p docker-laravel
```
Una vez creado, nos moveremos con `cd` a nuestro directorio raiz, dentro de`\docker-laravel` añadiremos los siguientes subdiretorios.

```md 
mkdir -p filebrowser_data
mkdir -p data
```

Continuamos con la creación de una base de datos en filebrowser.

```md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

Ya creada la base de datos, pasaremos con el administrador encargado de la base de datos, al ser una guia de ejemplo usaremos como usuario `admin` y contraseña `admin123`.

``` md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```

Creamos un archivo llamado `docker-compose.yml` con el siguiente contenido para definir y configurar todos los servicios, redes y base de datos que se necesita.

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

Una vez hecho el archivo `docker-compose.yml` ejecutamos el siguiente comando.

```
docker run --rm -v $(pwd)/laravel:/app composer create-project laravel/laravel 
```
---
### Creación del Docker de Wordpress


Para comezar con la creación del Docker-Compose de Wordpress haremos un directorio raiz llamado `docker-wordpress`.

```md 
mkdir -p docker-wordpress
```
Una vez creado, nos moveremos con `cd` a nuestro directorio raiz, dentro de`\docker-wordpress` añadiremos los siguientes subdiretorios.

```md 
mkdir -p filebrowser_data
mkdir -p data
```

Continuamos con la creación de una base de datos en filebrowser.

```md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

Ya creada la base de datos, pasaremos con el administrador encargado de la base de datos, al ser una guia de ejemplo usaremos como usuario `admin` y contraseña `admin123`.

``` md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```

Creamos un archivo llamado `docker-compose.yml` con el siguiente contenido para definir y configurar todos los servicios, redes y base de datos que se necesita.

```md 
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

  filebrowser:
    image: filebrowser/filebrowser:latest
    ports:
      - "8081:80"
    volumes:
      - ./filebrowser_data/filebrowser.db:/database.db
      - ./wordpress:/srv
    command: --database /database.db
    restart: always

  volumes:
      db_data:
```

Una vez creado y configurado los archivos pertinentes crearemos un subdirectorio para instalar el Wordpress
```
mkdir wordpress
```

---
### Creación del Docker de React-Vite


Para comezar con la creación del Docker-Compose de React-Vite haremos un directorio raiz llamado `docker-react`.

```md 
mkdir -p docker-react
```
Una vez creado, nos moveremos con `cd` a nuestro directorio raiz, dentro de`\docker-react` añadiremos los siguientes subdiretorios.

```md 
mkdir -p filebrowser_data
mkdir -p data
```

Continuamos con la creación de una base de datos en filebrowser.

```md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

Ya creada la base de datos, pasaremos con el administrador encargado de la base de datos, al ser una guia de ejemplo usaremos como usuario `admin` y contraseña `admin123`.

``` md 
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```

Creamos un archivo llamado `docker-compose.yml` con el siguiente contenido para definir y configurar todos los servicios, redes y base de datos que se necesita.

```
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
```



Con este comando generamos un `projecto vite` dentro del contenedor de Docker, sin necesidad de tener Node.js ni npm instalados en tu sistema operativo local. 

```
docker run -it --rm -v $(pwd)/react:/app -w /app node:18 bash -c "npm create vite@latest . -- --template react && npm install"
```




