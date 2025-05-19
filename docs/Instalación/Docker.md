---
sidebar_position: 3
---

# Instalación Docker Compose

Esta guía explica cómo configurar varios entornos de desarrollo utilizando Docker Compose, incluyendo sitios estáticos HTML, PHP, Laravel, WordPress y aplicaciones React-Vite.

## Estructura General

Cada servicio requiere su propio directorio con un proceso de configuración similar:

1. Crear un directorio raíz para el servicio
2. Agregar subdirectorios necesarios (`data`, `filebrowser_data`)
3. Inicializar la base de datos de FileBrowser
4. Crear un usuario administrador para FileBrowser
5. Crear un archivo `docker-compose.yml`
6. Iniciar los servicios

## Pasos Comunes de Configuración

Los siguientes pasos son comunes para todos los entornos:

### 1. Crear Base de Datos de FileBrowser

```bash
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  config init --database /srv/filebrowser.db
```

### 2. Crear Usuario Administrador

```bash
sudo docker run --rm \
  -v $(pwd)/filebrowser_data:/srv \
  filebrowser/filebrowser \
  users add admin admin123 --database /srv/filebrowser.db --perm.admin
```

## Configuraciones Específicas por Entorno

### 1. Entorno HTML Estático

#### Configuración de Directorios

```bash
# Crear directorio raíz
mkdir -p docker-estatico

# Navegar al directorio
cd docker-estatico

# Crear subdirectorios requeridos
mkdir -p filebrowser_data
mkdir -p data
```

#### Configuración de Docker Compose

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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

### 2. Entorno PHP

#### Configuración de Directorios

```bash
# Crear directorio raíz
mkdir -p docker-php

# Navegar al directorio
cd docker-php

# Crear subdirectorios requeridos
mkdir -p filebrowser_data
mkdir -p data
```

#### Configuración de Docker Compose

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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

### 3. Entorno Laravel

#### Configuración de Directorios

```bash
# Crear directorio raíz
mkdir -p docker-laravel

# Navegar al directorio
cd docker-laravel

# Crear subdirectorios requeridos
mkdir -p filebrowser_data
mkdir -p data
```

#### Configuración de Docker Compose

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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

#### Crear Proyecto Laravel

Después de configurar Docker Compose, crea un nuevo proyecto Laravel:

```bash
docker run --rm -v $(pwd)/laravel:/app composer create-project laravel/laravel .
```

### 4. Entorno WordPress

#### Configuración de Directorios

```bash
# Crear directorio raíz
mkdir -p docker-wordpress

# Navegar al directorio
cd docker-wordpress

# Crear subdirectorios requeridos
mkdir -p filebrowser_data
mkdir -p wordpress
```

#### Configuración de Docker Compose

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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

### 5. Entorno React-Vite

#### Configuración de Directorios

```bash
# Crear directorio raíz
mkdir -p docker-react

# Navegar al directorio
cd docker-react

# Crear subdirectorios requeridos
mkdir -p filebrowser_data
mkdir -p react
```

#### Configuración de Docker Compose

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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

#### Crear Proyecto React

Inicializa un nuevo proyecto React utilizando Vite:

```bash
docker run -it --rm -v $(pwd)/react:/app -w /app node:18 bash -c "npm create vite@latest . -- --template react && npm install"
```

## Ejecutando los Servicios

Para iniciar los servicios, navega al directorio respectivo y ejecuta:

```bash
docker compose up -d
```

Para detener los servicios:

```bash
docker compose down
```

## Acceso a los Servicios

| Servicio | URL | Descripción |
|---------|-----|-------------|
| HTML Estático | http://localhost:8080 | Servidor HTTP Apache |
| PHP | http://localhost:8080 | PHP con Apache |
| Laravel | http://localhost:8000 | Aplicación Laravel |
| WordPress | http://localhost:8082 | CMS WordPress |
| React-Vite | http://localhost:5173 | React con Vite |
| FileBrowser | http://localhost:8081 | Interfaz de Gestión de Archivos |

## Credenciales Predeterminadas

Para FileBrowser:
- Usuario: `admin`
- Contraseña: `admin123`

Para WordPress:
- Usuario de Base de Datos: `wordpress`
- Contraseña de Base de Datos: `wordpress`
- Contraseña de Root: `root`
