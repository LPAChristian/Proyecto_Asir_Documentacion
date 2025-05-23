---
sidebar_position: 3
---

# Endpoints Documentación

## Estructura General de la API

La API está construida con FastAPI y organizada en diferentes routers que agrupan endpoints por funcionalidad. Todos los endpoints protegidos requieren autenticación mediante clave API enviada en la cabecera `X-API-Key`.

## Autenticación

### Sistema de Autenticación

- **Método**: API Key en cabecera HTTP
- **Cabecera**: `X-API-Key`
- **Validación**: Verificación contra tabla `api_keys` en base de datos
- **Actualización**: `last_used` se actualiza en cada uso válido

### Función de Autenticación

```python
get_api_key(api_key_header: str = Security(api_key_header))
```

- Extrae la clave de la cabecera
- Valida contra base de datos
- Retorna HTTP 401 si es inválida o falta

## Endpoints Públicos

### Información General

- **GET /** - Endpoint de bienvenida
- **GET /heartbeat** - Estado de la API
- **GET /protected** - Endpoint de prueba protegido

### Streaming de Logs

- **GET /logs/stream** - Stream en tiempo real de logs del sistema
  - **Tipo**: Server-Sent Events (SSE)
  - **Media Type**: `text/event-stream`
  - **Funcionalidad**: Transmite nuevas líneas del archivo de log en tiempo real
  - **Nota**: Este endpoint NO requiere autenticación (posible vulnerabilidad de seguridad)

## Docker Services Endpoints

**Base Path**: Todos requieren autenticación API Key

### Consulta de Información

- **GET /service-types** - Lista tipos de servicios Docker disponibles
  - **Respuesta**: Array de strings con tipos como "Static", "PHP", "Node.js", etc.

- **GET /service/\{service_id\}** - Detalles de un servicio específico
  - **Parámetros**: `service_id` (int) en la URL
  - **Respuesta**: Detalles completos del servicio incluyendo URLs de acceso

### Creación de Servicios

- **POST /service** - Crear nuevo servicio Docker
  - **Content-Type**: `multipart/form-data`
  - **Parámetros requeridos**:
    - `userid` (str): ID del usuario
    - `service_name` (str): Nombre único del servicio
    - `service_types` (List[str]): Tipos de servicios a desplegar
  - **Parámetros opcionales**:
    - `primary_app_type` (str): Tipo principal de aplicación
    - `zip_file` (UploadFile): Archivo ZIP con código fuente
    - `git_repo_url` (str): URL de repositorio Git
    - `admin_pass` (str): Contraseña para Filebrowser
  - **Validaciones**:
    - Al menos un `service_type` debe especificarse
    - No se puede enviar `zip_file` y `git_repo_url` simultáneamente
    - `primary_app_type` debe ser válido si se especifica
  - **Proceso**:
    1. Validación de parámetros
    2. Guardado temporal de archivo ZIP (si aplica)
    3. Creación de estructura de directorios
    4. Clonado de Git o extracción de ZIP
    5. Generación de docker-compose.yml
    6. Despliegue con `docker compose up -d`
    7. Registro en base de datos

### Control de Servicios

- **POST /control-service/\{service_id\}/\{action\}** - Controlar servicio existente
  - **Parámetros**:
    - `service_id` (int): ID del servicio
    - `action` (str): Acción a ejecutar
  - **Acciones disponibles**:
    - `start`: Iniciar servicio
    - `shutdown`: Detener servicio  
    - `restart`: Reiniciar servicio
    - `delete`: Eliminar servicio completamente
  - **Proceso**:
    1. Validación de acción
    2. Obtención de información del servicio
    3. Ejecución de comando Docker Compose correspondiente
    4. Actualización de estado en base de datos

## Proxmox VM Endpoints

**Base Path**: Todos requieren autenticación API Key

### Consulta de VMs

- **GET /vm/\{vm_id\}** - Información de VM específica
  - **Parámetros**: `vm_id` (int) en la URL
  - **Respuesta**: Detalles completos de la VM incluyendo configuración y estado

### Creación de VMs

- **POST /vm** - Crear nueva máquina virtual
  - **Content-Type**: `multipart/form-data`
  - **Parámetros requeridos**:
    - `userid` (str): ID del usuario
    - `vm_name` (str): Nombre de la VM
    - `os_type` (str): Sistema operativo (Ubuntu, CentOS, Windows, etc.)
  - **Parámetros opcionales**:
    - `disksize` (int): Tamaño de disco en GB (10-500)
    - `memory` (int): Memoria RAM en MB
    - `cores` (int): Número de núcleos de CPU
    - `ssh_pub_key` (str): Clave SSH pública
  - **Proceso con Failover**:
    1. Asignación de VMID libre
    2. Registro previo en BD con estado "creating"
    3. Iteración sobre nodos disponibles (sv1-sv5)
    4. Verificación de recursos en cada nodo
    5. Clonación desde plantilla
    6. Configuración de recursos
    7. Redimensionamiento de disco (si necesario)
    8. Inicio de VM
    9. Actualización de estado a "enabled"

### Actualización de VMs

- **POST /vm/update/\{vm_id\}** - Actualizar recursos de VM
  - **Parámetros**:
    - `vm_id` (int): ID de la VM
    - `disksize` (int, opcional): Nuevo tamaño de disco
    - `memory` (int, opcional): Nueva cantidad de memoria
    - `cores` (int, opcional): Nuevo número de núcleos
  - **Proceso**:
    1. Localización del nodo de la VM
    2. Actualización de recursos (memoria/CPU)
    3. Redimensionamiento de disco (solo expansión)
    4. Reinicio forzado de la VM

### Conexión a VMs

- **POST /vm/connect/\{vm_id\}** - Generar ticket de conexión VNC/SPICE
  - **Parámetros**: `vm_id` (int)
  - **Proceso**: Ejecuta script externo para generar ticket de Proxmox
  - **Respuesta**: JSON con información de conexión

### Control de VMs

- **POST /control-vm/\{vm_id\}/\{action\}** - Controlar estado de VM
  - **Parámetros**:
    - `vm_id` (int): ID de la VM
    - `action` (str): Acción a ejecutar
  - **Acciones disponibles**:
    - `start`: Iniciar VM
    - `shutdown`: Apagar VM
    - `pause`: Pausar/suspender VM
    - `delete`: Eliminar VM completamente
  - **Proceso**:
    1. Validación de parámetros
    2. Localización del nodo (si no se especifica)
    3. Ejecución de acción via API de Proxmox
    4. Actualización de estado en BD
    5. Manejo especial para eliminación (incluyendo recursos HA)

## User Management Endpoints

### Creación de Usuarios

- **POST /users** - Crear nuevo usuario
  - **Content-Type**: `multipart/form-data`
  - **Parámetros**:
    - `userid` (str): ID único del usuario
    - `username` (str): Nombre de usuario
  - **Validaciones**: Verificación de unicidad antes de crear

### Consulta de Usuarios

- **GET /users/\{userid\}** - Información completa del usuario
  - **Parámetros**: `userid` (str)
  - **Respuesta**: 
    - Datos del usuario
    - Lista de servicios Docker asociados
    - Lista de VMs Proxmox asociadas
    - URLs de acceso formateadas

## Manejo de Errores

### Tipos de Excepciones Manejadas

1. **StarletteHTTPException**: Errores HTTP estándar
2. **RequestValidationError**: Errores de validación Pydantic (422)
3. **Exception**: Errores genéricos no controlados (500)

### Respuestas de Error Estandarizadas

- Todas las respuestas de error son JSON
- Los errores se loguean automáticamente
- Códigos HTTP apropiados
- Mensajes descriptivos sin exposición de información sensible

## Configuración de CORS

- **Orígenes permitidos**: `["*"]` (todos)
- **Métodos permitidos**: Todos
- **Cabeceras permitidas**: Todas
- **Nota**: Configuración muy permisiva, debería restringirse en producción

## Documentación Automática

- **Swagger UI**: Disponible en `/docs`
- **ReDoc**: Disponible en `/redoc`
- **OpenAPI Schema**: Generado automáticamente desde modelos Pydantic