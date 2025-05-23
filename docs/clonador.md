---
sidebar_position: 4
---

# Clonación de VM
# Guía Técnica: Clonación y Creación de Templates en Proxmox VE

## Visión General

Este documento detalla el procedimiento técnico para clonar máquinas virtuales y convertirlas en plantillas (templates) dentro del entorno de virtualización Proxmox VE. Los templates permiten el despliegue rápido y consistente de nuevas instancias virtualizadas.

## Requisitos Previos

| Requisito | Descripción |
|-----------|-------------|
| **VM Base** | Máquina virtual configurada y en estado apagado |
| **Almacenamiento** | Espacio suficiente disponible en el backend de almacenamiento |
| **Tipo de Almacenamiento** | Compatible con plantillas (local-lvm, ZFS, CEPH, etc.) |

## Procedimiento de Clonación

### Paso 1: Realizar Copia de la VM

1. **Acceso al Panel de Control**
   * Inicie sesión en la interfaz web de Proxmox VE
   * Localice la VM origen en el árbol de navegación

2. **Iniciar Proceso de Clonación**
   * Haga clic derecho sobre la VM objetivo
   * Seleccione la opción **Clonar**

3. **Configuración de Parámetros**
   * Complete los siguientes campos en el diálogo de configuración:

   | Parámetro | Valor Recomendado |
   |-----------|-------------------|
   | **ID de VM** | Valor numérico único dentro del cluster |
   | **Nombre** | Nomenclatura descriptiva (ej: `ubuntu-server-template-22.04`) |
   | **Modo de Clonación** | **Clon completo** (recomendado para templates) |
   | **Formato de Disco** | Mantenga el formato predeterminado |
   | **Almacenamiento Destino** | Seleccione el storage apropiado |

   > **Nota técnica**: El modo "Clon completo" crea una copia independiente de todos los discos, mientras que "Clon vinculado" utiliza copy-on-write para ahorrar espacio pero puede impactar el rendimiento.

4. **Ejecución**
   * Haga clic en el botón **Clonar** para iniciar el proceso
   * Monitorice el progreso en la pestaña de tareas

  

## Conversión a Template

### Paso 2: Transformación de VM a Plantilla

1. **Verificación de Estado**
   * Confirme que la VM clonada se encuentra **apagada**
   * Verifique que el almacenamiento seleccionado soporte plantillas

2. **Proceso de Conversión**
   * Navegue hasta la VM clonada en el panel izquierdo
   * Haga clic derecho sobre la VM
   * Seleccione **Convertir en plantilla**
   * Confirme la acción en el diálogo emergente

3. **Validación**
   * La VM convertida aparecerá ahora en la sección **Templates**
   * El icono cambiará para reflejar su nuevo estado

   

## Consideraciones Técnicas

* Los templates ocupan espacio de almacenamiento igual que una VM completa
* No es posible iniciar directamente un template (debe clonarse primero)
* Modificaciones posteriores al template requieren reconvertirlo a VM

## Uso Recomendado

Utilice templates para:
* Despliegue rápido de servidores con configuración preestablecida
* Garantizar consistencia en entornos de producción
* Reducir tiempo de aprovisionamiento de infraestructura


## Identificadores de VM (VM IDs)


Se ha establecido la siguiente convención de IDs para las plantillas (y VMs clonadas de ellas) en los nodos:


| Nodo | Windows 11 | Windows Server 2025 | Windows Server 2022 | Ubuntu Client | Ubuntu Server | Fedora | RedHat |
| :--- | :--------- | :-------------------- | :-------------------- | :------------ | :------------ | :----- | :----- |
| sv1  | 151        | 152                   | 153                   | 154           | 155           | 156    | 157    |
| sv2  | 251        | 252                   | 253                   | 254           | 255           | 256    | 257    |
| sv3  | 351        | 352                   | 353                   | 354           | 355           | 356    | 357    |
| sv4  | 451        | 452                   | 453                   | 454           | 455           | 456    | 457    |
| sv5  | 551        | 552                   | 553                   | 554           | 555           | 556    | 557    |
| sv6  | 651        | 652                   | 653                   | 654           | 655           | 656    | 657    |
| sv7  | 751        | 752                   | 753                   | 754           | 755           | 756    | 757    |
| sv8  | 851        | 852                   | 853                   | 854           | 855           | 856    | 857    |

