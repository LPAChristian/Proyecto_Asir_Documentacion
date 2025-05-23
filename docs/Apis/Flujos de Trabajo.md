---
sidebar_position: 7
---
# Flujos de Trabajo Clave

## Creación de una Nueva VM Proxmox

1. **Solicitud del Cliente:** El cliente envía un POST /vm con los detalles de la VM (userid, nombre, SO, recursos, etc.) y una X-API-Key válida.

2. **Autenticación:** auth.get_api_key valida la clave API.

3. **Router (proxmox_routes.create_vm):**
   - Recibe y valida los datos del formulario usando el modelo VMCreate.
   - Instancia ProxmoxService.
   - Llama a proxmox_service.create_vm_atomic().

4. **Servicio (ProxmoxService.create_vm_atomic):**
   - Obtiene un VMID libre (get_free_vmid()).
   - Registra la VM en la BD (proxmox_vms) con estado "creating".
   - Itera sobre los nodos Proxmox configurados (sv1 a sv5):
     - Verifica conectividad y recursos del nodo.
     - Encuentra el ID de la plantilla para el SO en ese nodo.
     - Clona la plantilla para crear la nueva VM.
     - Configura CPU, RAM, disco y claves SSH en la VM clonada.
     - Inicia la VM.
     - Si tiene éxito, actualiza el estado en la BD a "enabled" y termina el bucle de nodos.

5. **Respuesta:** El router devuelve los detalles de la VM creada (o un mensaje de error/estado "creating" si hubo problemas).

## Creación de un Nuevo Servicio Docker

1. **Solicitud del Cliente:** El cliente envía un POST /service con userid, service_name, service_types, y opcionalmente un zip_file o git_repo_url, junto con la X-API-Key.

2. **Autenticación:** auth.get_api_key valida la clave.

3. **Router (docker_routes.create_service_endpoint):**
   - Valida los parámetros.
   - Si hay zip_file, lo guarda temporalmente.
   - Instancia DockerService (inyectada por dependencia).
   - Llama a docker_service.create_service().

4. **Servicio (DockerService.create_service):**
   - Crea la estructura de directorios para el servicio (_ensure_base_paths).
   - Si hay git_repo_url, clona el repo en el directorio data/.
   - Si hay zip_path, extrae el ZIP en data/.
   - Inicializa Filebrowser (_init_filebrowser).
   - Usa ComposeBuilder.build() para generar el docker-compose.yml.
   - Escribe el docker-compose.yml y un .env por defecto.
   - Ejecuta docker compose up -d para desplegar los servicios.
   - Registra el servicio en la BD (docker_services).

5. **Respuesta:** El router devuelve los detalles del servicio creado, incluyendo URLs de acceso.

Esta documentación ahora incluye una descripción más profunda de la lógica interna de cada script y cómo interactúan, proporcionando una visión más completa del sistema CloudFaster API.