---
sidebar_position: 5
---
# Docker Endpoint

## Arquitectura del Sistema Docker

### Estructura de Directorios
El sistema Docker utiliza una estructura de directorios organizada por usuarios y servicios:

```
{DOCKER_BASE_PATH}/
└── users/
    └── {username}/
        └── {service_name}/
            ├── docker-compose.yml
            ├── .env
            ├── data/              # Código del usuario
            └── filebrowser_data/  # Base de datos de Filebrowser
                └── filebrowser.db
```

### Configuración Base
- **Red Principal**: `traefik_net` (externa, gestionada por Traefik)
- **Proxy Reverso**: Traefik para HTTPS automático
- **Gestión de Archivos**: Filebrowser incluido en cada servicio
- **Dominio Base**: Configurado en `settings.BASE_DOMAIN`

## Clase DockerService

### Inicialización y Configuración

#### `__init__()`
```python
def __init__(self):
    self.base_path = settings.DOCKER_BASE_PATH
    self.db_service = DatabaseService(...)
    self.compose_builder = ComposeBuilder()
```

**Componentes**:
- **Ruta Base**: Directorio raíz para todos los servicios Docker
- **Servicio BD**: Para logging y gestión de estados
- **Constructor Compose**: Para generar archivos docker-compose.yml

### Gestión de Estructura de Directorios

#### `_ensure_base_paths(userid, service_name)`
**Proceso de Creación**:
1. **Resolución de Usuario**: Obtiene `username` desde BD usando `userid`
2. **Construcción de Rutas**:
   ```python
   service_root = {base_path}/users/{username}/{service_name}/
   data_dir = service_root/data/
   filebrowser_data_dir = service_root/filebrowser_data/
   ```
3. **Creación de Directorios**: Asegura existencia de toda la estructura
4. **Retorno**: Devuelve rutas para uso posterior

### Gestión de Código Fuente

#### Extracción Segura de ZIP
```python
def _safe_extract(zip_path, dest_path):
    # Extracción con validación de seguridad
    # Prevención de path traversal
    # Extracción completa del contenido
```

#### Manejo de Repositorios Git
**Proceso de Clonación**:
1. **Limpieza Previa**: Elimina contenido existente en `data_dir`
2. **Clonación**: `git clone {repo_url} {data_dir}`
3. **Validación**: Verifica éxito de la operación
4. **Manejo de Errores**: Logging de fallos de clonación

### Inicialización de Filebrowser

#### `_init_filebrowser(service_root_path, admin_pass)`
**Proceso de Inicialización**:
1. **Configuración de Base de Datos**:
   ```bash
   docker run --rm -v {filebrowser_data}:/database \
       filebrowser/filebrowser config init --database /database/filebrowser.db
   ```

2. **Creación de Usuario Admin**:
   ```bash
   docker run --rm -v {filebrowser_data}:/database \
       filebrowser/filebrowser users add admin {admin_pass} \
       --database /database/filebrowser.db --perm.admin
   ```

**Características**:
- **Aislamiento**: Cada servicio tiene su propia instancia de Filebrowser
- **Persistencia**: Base de datos SQLite separada por servicio
- **Acceso**: Usuario admin con permisos completos
- **Volúmenes**: Acceso al directorio `data/` del servicio

### Creación de Servicios

#### `create_service(userid, service_name, service_types, ...)`

**Validaciones Iniciales**:
- Al menos un `service_type` debe especificarse
- Validación de tipos de servicio soportados
- Verificación de parámetros mutuamente excluyentes

**Proceso Completo**:

##### 1. Preparación de Estructura
```python
service_root_path, data_dir, filebrowser_data_dir = self._ensure_base_paths(userid, service_name)
```

##### 2. Gestión de Código Fuente
**Repositorio Git**:
```python
if git_repo_url:
    # Limpieza de directorio existente
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    # Clonación del repositorio
    subprocess.run(["git", "clone", git_repo_url, data_dir], check=True)
```

**Archivo ZIP**:
```python
if zip_path:
    self._safe_extract(zip_path, data_dir)
    os.remove(zip_path)  # Limpieza del archivo temporal
```

**Sin Código Fuente**:
```python
else:
    os.makedirs(data_dir, exist_ok=True)
```

##### 3. Creación de Directorios Específicos
```python
# Directorios para bases de datos si se requieren
if "MySQL" in service_types:
    os.makedirs(os.path.join(data_dir, "mysql_data"), exist_ok=True)
if "PostgreSQL" in service_types:
    os.makedirs(os.path.join(data_dir, "postgres_data"), exist_ok=True)
```

##### 4. Inicialización de Filebrowser
```python
self._init_filebrowser(service_root_path, admin_pass or "admin123")
```

##### 5. Determinación del Servicio Principal
```python
# Prioridad: servicios web sobre bases de datos
priority_order = ["Static", "PHP", "Node.js", "React", "Python", ...]
for service_type in priority_order:
    if service_type in service_types:
        primary_app_type = service_type
        break
```

##### 6. Generación de Docker Compose
```python
compose_content = self.compose_builder.build(
    project_service_name=service_name,
    requested_app_services=service_types,
    primary_app_type=primary_app_type
)
```

##### 7. Creación de Archivos de Configuración
**docker-compose.yml**:
```python
compose_path = os.path.join(service_root_path, "docker-compose.yml")
with open(compose_path, "w") as f:
    f.write(compose_content)
```

**.env**:
```python
env_content = f"""
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=defaultdb
MYSQL_USER=user
MYSQL_PASSWORD=password
POSTGRES_PASSWORD=postgres
POSTGRES_DB=defaultdb
POSTGRES_USER=postgres
"""
```

##### 8. Despliegue de Servicios
```python
subprocess.run(
    ["docker", "compose", "up", "-d"],
    cwd=service_root_path,
    check=True
)
```

##### 9. Registro en Base de Datos
```python
service_id = self.db_service.log_docker_service_creation(
    userid=userid,
    service_name=service_name,
    webtype_id=webtype_id,
    status="enabled"
)
```

##### 10. Construcción de Respuesta
```python
return {
    "service_id": service_id,
    "service_name": service_name,
    "status": "enabled",
    "urls": {
        "main": f"https://{service_name}.{settings.BASE_DOMAIN}",
        "filebrowser": f"https://{service_name}-filebrowser.{settings.BASE_DOMAIN}"
    },
    "service_types": service_types,
    "primary_app_type": primary_app_type
}
```

### Control de Servicios

#### `control_service(userid, service_name, action)`

**Validaciones**:
- Existencia del servicio (verificación de `docker-compose.yml`)
- Acción válida (`start`, `shutdown`, `restart`, `delete`)

**Mapeo de Acciones**:
```python
docker_actions = {
    "start": "up -d",
    "shutdown": "stop", 
    "restart": "restart",
    "delete": "down -v"  # -v elimina volúmenes
}
```

**Proceso de Ejecución**:
1. **Localización del Servicio**:
   ```python
   username = self.db_service.get_user_by_userid(userid)["username"]
   target = f"{self.base_path}/users/{username}/{service_name}"
   ```

2. **Verificación de Existencia**:
   ```python
   compose_file = os.path.join(target, "docker-compose.yml")
   if not os.path.exists(compose_file):
       raise FileNotFoundError("Service not found")
   ```

3. **Ejecución de Comando**:
   ```python
   subprocess.run(
       f"docker compose {docker_actions[action]}".split(),
       cwd=target,
       check=True
   )
   ```

4. **Actualización de Estado**:
   ```python
   if action == "delete":
       self.db_service.delete_docker_service(userid, service_name)
   else:
       new_status = "enabled" if action == "start" else "disabled"
       self.db_service.update_docker_service_status(userid, service_name, new_status)
   ```

## Sistema de Plantillas Docker

### Estructura de Plantillas

#### `APP_SERVICE_TEMPLATES`
Diccionario con plantillas para cada tipo de servicio:

```python
APP_SERVICE_TEMPLATES = {
    "Static": """
  {app_service_name_in_yaml}:
    image: nginx:alpine
    networks:
      - traefik_net
    volumes:
      - ./data:/usr/share/nginx/html:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.{service_name}-{main_service_host_suffix}.rule=Host(`{service_name}.{domain}`)"
      - "traefik.http.routers.{service_name}-{main_service_host_suffix}.tls.certresolver=letsencrypt"
    """,
    
    "PHP": """
  {app_service_name_in_yaml}:
    image: php:8.2-apache
    networks:
      - traefik_net
    volumes:
      - ./data:/var/www/html
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.{service_name}-{main_service_host_suffix}.rule=Host(`{service_name}.{domain}`)"
      - "traefik.http.routers.{service_name}-{main_service_host_suffix}.tls.certresolver=letsencrypt"
    """,
    
    # ... más plantillas
}
```

#### Características de las Plantillas:
- **Placeholders**: `{service_name}`, `{app_service_name_in_yaml}`, `{main_service_host_suffix}`
- **Red Traefik**: