---
sidebar_position: 5
---

# Creación de Cluster


# Manual Técnico: Implementación de Clúster en Proxmox VE

## Introducción

La configuración de un entorno clusterizado en Proxmox Virtual Environment (PVE) permite centralizar la gestión de recursos, implementar alta disponibilidad y facilitar la migración de cargas de trabajo entre nodos físicos. Este documento detalla el procedimiento completo para establecer dicha infraestructura.

## Objetivos

La implementación de un clúster Proxmox proporciona las siguientes ventajas operativas:

* Administración centralizada mediante una única interfaz web
* Capacidades de migración de máquinas virtuales entre nodos
* Configuración de alta disponibilidad (HA) para servicios críticos
* Gestión unificada de almacenamiento compartido
* Balanceo de carga automatizado

## Requisitos de Infraestructura

### Requisitos Técnicos

| Componente | Especificación |
|------------|----------------|
| **Software** | Proxmox VE (misma versión en todos los nodos) |
| **Configuración de Red** | IPs estáticas en todos los nodos |
| **Conectividad** | Red interna dedicada, preferiblemente sin NAT |
| **Almacenamiento** | Preferentemente compartido (no obligatorio) |
| **Acceso** | Privilegios de root en todos los nodos |

### Requisitos de Configuración

1. **Identificación de Nodos**
   * Cada servidor debe tener un hostname único (ej: sv1, sv2, sv3, sv4, sv5)
   * El nodo maestro será designado como "sv1" en este procedimiento

2. **Resolución de Nombres**
   * Los nodos deben poder resolverse mutuamente por nombre y dirección IP
   * Verificación mediante pruebas de ping bidireccionales

3. **Conectividad SSH**
   * Acceso SSH con privilegios root habilitado entre todos los nodos
   * Proxmox habilita esta configuración por defecto

4. **Estado de Servicios**
   * No deben existir máquinas virtuales activas en los nodos secundarios durante el proceso de incorporación

## 🔧 Procedimiento de Implementación

### Fase 1: Configuración del Nodo Principal

1. **Acceso al Servidor Maestro**
   ```bash
   # Acceda mediante SSH o desde la consola local al nodo designado como principal (sv1)
   ssh root@IP_DEL_NODO_PRINCIPAL
   ```

2. **Inicialización del Clúster**
   ```bash
   # Cree el clúster con un nombre descriptivo
   pvecm create nombre_del_cluster
   ```

3. **Verificación de Creación**
   ```bash
   # Confirme el estado del clúster recién creado
   pvecm status
   ```

   > **Resultado**: La salida del comando mostrará el nodo actual como único miembro del clúster.

### Fase 2: Incorporación de Nodos Secundarios

1. **Acceso al Primer Nodo Secundario**
   ```bash
   # Conéctese al nodo secundario (sv2)
   ssh root@IP_DEL_NODO_SECUNDARIO
   ```

2. **Proceso de Unión al Clúster**
   ```bash
   # Incorpore el nodo secundario al clúster principal
   pvecm add IP_DEL_NODO_PRINCIPAL
   ```

   > **Nota**: Se solicitará la contraseña root del nodo principal durante este proceso.

3. **Verificación de Sincronización**
   ```bash
   # Confirme que el nodo se ha unido correctamente
   pvecm status
   ```

   > **Resultado**: La salida mostrará ambos nodos como miembros activos del clúster.

4. **Comprobación Visual**
   * Acceda a la interfaz web de Proxmox VE
   * Verifique que el panel lateral muestre todos los nodos incorporados

### Fase 3: Expansión del Clúster

1. **Repetición del Procedimiento**
   * Repita los pasos de la Fase 2 para cada nodo adicional (sv3, sv4, sv5)
   * Ejecute desde cada nodo secundario:
   
   ```bash
   pvecm add IP_DEL_NODO_PRINCIPAL
   ```

2. **Verificación Final del Clúster**
   ```bash
   # Ejecute en cualquier nodo para verificar la configuración completa
   pvecm status
   ```

## Consideraciones Importantes

### Limitaciones y Precauciones

* **Punto de No Retorno**: La separación de un nodo del clúster es un proceso complejo; se recomienda reinstalación completa en caso necesario
* **Tiempo de Sincronización**: Para clústeres grandes, permita tiempo suficiente para la sincronización inicial de datos
* **Máquinas Virtuales Activas**: Asegúrese de que no existan VMs en ejecución en los nodos secundarios antes de unirlos al clúster
* **Conectividad de Red**: Cualquier interrupción durante el proceso puede dejar los nodos en estado inconsistente

### Mejores Prácticas

* **Red Dedicada**: Implemente una red dedicada para el tráfico de clúster
* **Configuración de Quorum**: Para clústeres con más de dos nodos, configure correctamente el quorum
* **Verificación periódica**: Monitorice regularmente el estado del clúster con `pvecm status`
* **Documentación**: Mantenga un registro de las IPs y hostnames de todos los nodos del clúster

## Verificación Post-Implementación

Tras completar la configuración, se recomienda realizar las siguientes pruebas:

1. Migración de VM entre nodos
2. Verificación de funcionamiento tras la simulación de caída de un nodo
3. Comprobación de acceso centralizado a almacenamiento compartido

