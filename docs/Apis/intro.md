---
sidebar_position: 1
---

# Información Técnica



La API CloudFaster es un servicio backend robusto y modular, desarrollado con el framework FastAPI en Python. Su objetivo principal es proporcionar una interfaz programática para la gestión y orquestación de recursos de infraestructura, específicamente máquinas virtuales (VMs) en un entorno Proxmox VE y servicios contenerizados mediante Docker. Esta API permite a los usuarios y sistemas automatizados interactuar con estos recursos de manera eficiente y controlada.

## Funcionalidades Principales Detalladas

### Gestión de Usuarios
Permite el registro de usuarios en el sistema. Cada usuario tiene un userid único y un username. Esta entidad es fundamental para asociar los recursos creados (VMs, servicios Docker) a un propietario.

### Gestión de VMs Proxmox
Ofrece un CRUD (Crear, Leer, Actualizar, Eliminar) completo para VMs.

- **Creación:** Clona VMs a partir de plantillas predefinidas en los nodos Proxmox. Incluye lógica de selección de nodo (failover) y asignación de recursos (CPU, RAM, disco).
- **Obtención de detalles:** Permite consultar la configuración y estado de una VM.
- **Actualización de recursos:** Modificación en caliente (si es posible) o programada de CPU, RAM y tamaño de disco.
- **Control de estado:** Operaciones como arrancar, apagar, pausar y eliminar VMs.
- **Generación de tickets de conexión:** Facilita el acceso a la consola de la VM (VNC/SPICE).

### Gestión de Servicios Docker
Permite desplegar y administrar aplicaciones multicontenedor.

- **Creación:** Genera y ejecuta configuraciones de Docker Compose a partir de plantillas para diversos tipos de aplicaciones (web estática, PHP, Node.js, bases de datos como MySQL/PostgreSQL, React, e incluso VMs macOS en Docker). Admite el despliegue de código fuente proporcionado en archivos ZIP o clonado desde repositorios Git. Incluye automáticamente un servicio Filebrowser para la gestión de archivos del servicio desplegado.
- **Control de estado:** Operaciones como arrancar, reiniciar, detener y eliminar conjuntos de servicios definidos en un docker-compose.yml.

### Autenticación
Protege el acceso a la API mediante claves API (API Keys). Cada solicitud a endpoints protegidos debe incluir una clave válida en la cabecera X-API-Key.

### Logging
Implementa un sistema de registro de eventos exhaustivo, tanto en consola (con formato enriquecido para desarrollo) como en archivos rotativos para producción y auditoría. Ofrece un endpoint de streaming para monitorizar los logs en tiempo real.

### Configuración Dinámica
La configuración de la aplicación (credenciales de base de datos, Proxmox, rutas base, etc.) se carga de forma flexible desde variables de entorno o un archivo .env, facilitando la adaptación a diferentes entornos de despliegue.

## Tecnologías Utilizadas

### FastAPI
Framework moderno y de alto rendimiento para construir APIs en Python, basado en type hints de Python estándar. Proporciona validación automática de datos, serialización, documentación interactiva (Swagger UI y ReDoc) y un sistema de dependencias potente.

### Pydantic
Librería utilizada por FastAPI para la validación de datos y la gestión de la configuración. Permite definir modelos de datos claros y concisos.

### Proxmoxer
Cliente Python para la API de Proxmox VE, simplificando la interacción con el hipervisor para la gestión de VMs y contenedores.

### Docker SDK (uso indirecto)
Aunque no se usa directamente la librería docker de Python para todas las operaciones, la API orquesta servicios Docker mediante la ejecución de comandos docker compose en el sistema host.

### MySQL Connector/Python
Driver oficial de Python para MySQL, utilizado para todas las operaciones de base de datos.

### Uvicorn
Servidor ASGI (Asynchronous Server Gateway Interface) ligero y rápido, utilizado para ejecutar la aplicación FastAPI.

### Rich
Librería para enriquecer la salida en la terminal, utilizada aquí para el logging en consola.

### Python-dotenv
Para cargar variables de entorno desde archivos .env.