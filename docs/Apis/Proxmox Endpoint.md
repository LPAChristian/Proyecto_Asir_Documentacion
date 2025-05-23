---
sidebar_position: 6
---
# Proxmox Endpoint

## Arquitectura del Sistema Proxmox

### Configuración Multi-Nodo
El sistema está diseñado para trabajar con múltiples nodos Proxmox configurados en la estructura `NODES` en `app/models.py`:

```python
NODES = [
    {
        "name": "sv1",
        "host": "ip_del_servidor_1",
        "template_ids": {
            OS.UBUNTU: id_template_ubuntu,
            OS.CENTOS: id_template_centos,
            # ... más sistemas operativos
        }
    },
    # ... más nodos (sv2, sv3, sv4, sv5)
]
```

### Gestión de Conexiones
- **Pool de Clientes**: Cache de conexiones ProxmoxAPI para evitar reconexiones
- **Timeout**: 30 segundos para todas las operaciones
- **Verificación**: Validación de conectividad antes de usar cada cliente
- **Credenciales**: Centralizadas en `settings` (usuario, contraseña, verificación SSL)

## Clase ProxmoxService

### Inicialización y Gestión de Clientes

#### `_get_client(node_name)`
```python
def _get_client(node_name):
    # Obtiene o crea cliente para nodo específico
    # Cachea conexiones en self.clients
    # Verifica conectividad antes de devolver
```

**Proceso**:
1. Verifica si ya existe cliente cacheado para el nodo
2. Si no existe, obtiene configuración del nodo desde `NODES`
3. Crea nueva instancia `ProxmoxAPI` con timeout extendido
4. Prueba conectividad con `prox.version.get()`
5. Cachea cliente para uso futuro
6. Devuelve cliente listo para usar

### Gestión de VMIDs

#### Rangos por Sistema Operativo
```python
OS_ID_RANGES = {
    OS.UBUNTU: (1000, 1999),
    OS.CENTOS: (2000, 2999),
    OS.WINDOWS: (3000, 3999),
    # ... más rangos
}
```

#### `get_free_vmid(os_type)`
**Lógica de Asignación**:
1. **Determinación de Rango**: Obtiene rango específico para el OS
2. **Consulta Multi-Nodo**: Itera todos los nodos para obtener VMIDs en uso
3. **Consulta Base de Datos**: Obtiene VMIDs registrados pero posiblemente no creados
4. **Combinación**: Une ambas listas de IDs ocupados
5. **Búsqueda**: Encuentra primer ID libre en el rango apropiado
6. **Fallback**: Si no hay IDs libres, usa rango 9000-9999

### Verificación de Recursos

#### `check_node_resources(node_name, disksize, memory)`
**Validaciones**:
- **Espacio en Disco**: Verifica disponibilidad en storage "local"
- **Memoria RAM**: Confirma memoria libre suficiente
- **Umbrales**: Mantiene margen de seguridad para operaciones del sistema

### Creación de VMs con Failover

#### `create_vm_atomic(userid, os_type, vm_name, ...)`

**Estrategia de Failover**:
```python
nodes_to_try = ["sv1", "sv2", "sv3", "sv4", "sv5"]
```

**Proceso Completo**:

##### 1. Preparación Inicial
- Obtención de VMID libre
- Registro previo en BD con estado "creating"
- Sanitización del nombre de VM

##### 2. Iteración por Nodos
Para cada nodo en `nodes_to_try`:

**a) Verificaciones Previas**:
- Conectividad al nodo
- Recursos disponibles suficientes
- Existencia de plantilla para el OS

**b) Proceso de Clonación**:
```python
# Clonación con reintentos para manejar locks
_execute_with_retry(
    func=lambda: client.nodes(node).qemu.post(
        vmid=vmid,
        clone=template_id,
        name=sanitized_name,
        full=1  # Clonación completa
    ),
    max_retries=3,
    retry_delay=10
)
```

**c) Configuración Post-Clonación**:
- **Espera de Disponibilidad**: `_wait_for_vm_ready()`
- **Configuración de Recursos**:
  - Cores de CPU
  - Memoria RAM  
  - Claves SSH (si se proporcionan)
- **Redimensionamiento de Disco** (si necesario):
  - Solo expansión permitida
  - Múltiples métodos (PUT/POST) por compatibilidad
  - Reintentos para manejar locks de Proxmox

**d) Inicio de VM**:
- Comando start via API
- Verificación de estado

##### 3. Manejo de Estados
- **Éxito**: Estado "enabled" en BD, retorna VMID positivo
- **Fallo**: Continúa con siguiente nodo
- **Fallo Total**: Retorna VMID negativo, mantiene estado "creating"

### Control de VMs Existentes

#### `control_vm(vm_id, action, node)`

**Acciones Soportadas**:
- **start**: `prox.nodes(node).qemu(vm_id).status.start.post()`
- **shutdown**: `prox.nodes(node).qemu(vm_id).status.shutdown.post()`
- **pause**: `prox.nodes(node).qemu(vm_id).status.suspend.post()`
- **delete**: Proceso complejo de eliminación

**Proceso de Eliminación**:
1. **Detención Forzada**: Si la VM está corriendo
2. **Espera de Liberación**: Pausa para liberar locks
3. **Eliminación Estándar**: `prox.nodes(node).qemu(vm_id).delete()`
4. **Manejo HA**: Si falla, intenta con `purge=1` para recursos HA
5. **Limpieza BD**: Elimina registro de `proxmox_vms`

### Actualización de Recursos

#### `update_vm_resources(vmid, node, memory, cores)`
- **Validación**: Recursos dentro de límites permitidos
- **Aplicación**: Actualización via API de configuración de VM
- **Reinicio**: Puede requerir reinicio para aplicar cambios

#### `resize_disk(vmid, new_size, node)`
- **Restricción**: Solo expansión permitida (no reducción)
- **Identificación**: Opera sobre disco principal (scsi0)
- **Formato**: Conversión a formato Proxmox (ej: "50G")
- **Verificación**: Confirma nuevo tamaño después de operación

### Localización de VMs

#### `get_node_for_vm(vmid)`
**Proceso de Búsqueda**:
1. Itera sobre todos los nodos configurados
2. Consulta cada nodo por la VM específica
3. Retorna nombre del nodo donde se encuentra
4. Útil cuando el nodo no se especifica en operaciones

### Manejo de Errores y Reintentos

#### `_execute_with_retry(func, max_retries, retry_delay)`
**Lógica de Reintentos**:
- **Detección de Lock**: Identifica errores de bloqueo de recursos
- **Espera Progresiva**: Delay entre reintentos
- **Límite de Intentos**: Evita bucles infinitos
- **Re-lanzamiento**: Propaga error si se agotan reintentos

**Errores Comunes de Proxmox**:
- **500 Internal Server Error**: Locks temporales
- **Timeout**: Operaciones que toman tiempo
- **Resource Busy**: Otro proceso usando la VM

### Optimizaciones y Cache

#### Gestión de Plantillas
- **Validación de Existencia**: Verifica plantilla antes de clonar
- **Cache de IDs**: Reutilización de template_ids por nodo
- **Fallback**: Manejo de plantillas no disponibles

#### Gestión de Estado
- **Estados Consistentes**: Sincronización entre Proxmox y BD
- **Estados Intermedios**: Manejo de "creating", "enabled", etc.
- **Limpieza**: Eliminación de registros huérfanos

### Seguridad y Validación

#### Sanitización de Nombres
```python
def _sanitize_vm_name(name):
    # Solo caracteres alfanuméricos y guiones
    # Longitud máxima controlada
    # Prevención de caracteres especiales
```

#### Validación de Parámetros
- **Rangos de Memoria**: Límites mínimos y máximos
- **Tamaños de Disco**: Validación de rangos permitidos
- **VMIDs**: Verificación de rangos por OS
- **Nombres**: Sanitización contra inyección

### Monitoreo y Logging

#### Logging Detallado
- **Operaciones Críticas**: Creación, eliminación, errores
- **Estados de Transición**: Cambios de estado de VMs
- **Errores de Red**: Problemas de conectividad con nodos
- **Reintentos**: Información sobre operaciones con retry

El sistema Proxmox está diseñado para ser robusto, con failover automático, manejo de errores comprehensivo y operaciones atómicas que mantienen la consistencia entre la API de Proxmox y la base de datos del sistema.