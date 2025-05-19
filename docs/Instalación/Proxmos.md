---
sidebar_position: 6
---

# Instalación de Proxmox VE

## Introducción

**Proxmox VE (Virtual Environment)** es una plataforma de virtualización de código abierto basada en Debian que permite crear y administrar máquinas virtuales (KVM) y contenedores (LXC) desde una interfaz web completa e intuitiva.

Esta guía cubre la instalación de Proxmox VE y la creación de máquinas virtuales, con un enfoque especial en la instalación de Windows 11.

## Requisitos del Sistema

### Hardware Recomendado

| Componente | Especificación |
|------------|----------------|
| **CPU** | 16 núcleos (2 sockets) — Intel Xeon E5530 @ 2.40GHz |
| **RAM** | Mínimo 16 GB (15.62 GiB en nuestro ejemplo) |
| **Almacenamiento** | Al menos 100 GB (93.93 GiB con 2.79 GiB usados) |
| **Virtualización** | BIOS con **VT-x** / **AMD-V** habilitado |
| **Red** | Al menos una tarjeta de red compatible |

### Configuración de Red

| Nombre | Tipo | Activa | Autostart | VLAN | Puertos/Esclavos | CIDR | Puerta de Enlace |
|--------|------|--------|-----------|------|------------------|------|------------------|
| eno1   | Dispositivo de Red | Sí | No | No | - | - | - |
| eno2   | Dispositivo de Red | No | No | No | - | - | - |
| vmbr0  | Puente Linux | Sí | Sí | No | eno1 | 192.168.52.241/24 | 192.168.52.1 |
| vmbr1  | Puente Linux | Sí | Sí | No | eno1 | - | - |

### Software Necesario

- **Imagen ISO de Proxmox VE:** [Proxmox VE 8.4.1 ISO](https://enterprise.proxmox.com/iso/proxmox-ve_8.4-1.iso)
- **Herramienta para crear USB booteable:** Rufus, Balena Etcher o similar
- **Imagen ISO de Windows 11** (para la VM de ejemplo)
- **Controladores VirtIO:** [Virtio-win ISO](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso)

## Instalación de Proxmox VE

### 1. Preparación del Medio de Instalación

1. Descarga la [ISO oficial de Proxmox VE 8.4.1](https://enterprise.proxmox.com/iso/proxmox-ve_8.4-1.iso)
2. Crea un USB booteable usando Rufus, Balena Etcher u otra herramienta similar:
   - Selecciona la ISO de Proxmox VE
   - Selecciona la unidad USB
   - Haz clic en "Iniciar" y espera a que finalice el proceso

### 2. Instalación del Sistema

1. Conecta el USB al servidor y arranca desde él
2. En la pantalla de inicio, selecciona **"Install Proxmox VE"**
3. Acepta el acuerdo de licencia
4. Selecciona el disco donde instalar Proxmox VE
5. Configura la zona horaria y la distribución del teclado
6. Establece una contraseña segura para el usuario `root`
7. Configura la red:
   - **Hostname:** nombre para tu servidor (ej. `proxmox.local`)
   - **Dirección IP:** configura una IP estática (recomendado)
   - **Máscara de red:** normalmente `255.255.255.0`
   - **Puerta de enlace:** dirección IP de tu router
   - **Servidor DNS:** puedes usar `8.8.8.8` (Google) o el de tu proveedor
8. Revisa la configuración y haz clic en "Instalar"
9. Una vez completada la instalación, reinicia el servidor

### 3. Primer Acceso

1. Abre un navegador web y navega a `https://IP_DEL_SERVIDOR:8006`
2. Acepta la advertencia de seguridad del certificado autofirmado
3. Inicia sesión con:
   - **Usuario:** `root`
   - **Contraseña:** la que estableciste durante la instalación
   

## Características Principales de Proxmox VE 8.4

Proxmox VE 8.4 incluye los siguientes componentes clave:

- **Kernel Linux 6.5** optimizado para virtualización
- **KVM (Kernel-based Virtual Machine)** para máquinas virtuales completas
- **LXC (Linux Containers)** para virtualización a nivel de sistema operativo
- **Sistemas de almacenamiento avanzados:**
  - ZFS (sistema de archivos transaccional)
  - LVM (Logical Volume Manager)
  - Ceph (almacenamiento distribuido)
- **Gestión flexible:**
  - Interfaz Web GUI completa
  - Herramientas de línea de comandos (CLI)
  - API REST para automatización
- **Proxmox Backup Server** (opcional) para copias de seguridad
- **Cluster Proxmox VE** para alta disponibilidad
- **Seguridad integrada:** Firewall y soporte para VLANs

## Creación de una Máquina Virtual con Windows 11

### 1. Preparación de Recursos

Antes de comenzar, asegúrate de tener:

1. Una imagen ISO de Windows 11
2. La imagen ISO de controladores VirtIO
3. Ambas ISOs subidas al almacenamiento de Proxmox:
   - Ve a **Datacenter → Storage → [tu almacenamiento] → Content → Upload**

### 2. Crear la VM

1. En el panel izquierdo, selecciona tu nodo Proxmox
2. Haz clic en **Create VM** en la esquina superior derecha

#### Pestaña General

- **Node:** El nodo actual (seleccionado automáticamente)
- **VM ID:** Deja el valor predeterminado
- **Name:** `Windows11` (o un nombre descriptivo)

#### Pestaña OS (Sistema Operativo)

- **Use CD/DVD disc image file (ISO):** Activado
- **Storage:** Selecciona el almacenamiento donde subiste la ISO
- **ISO Image:** Selecciona la imagen ISO de Windows 11
- **Guest OS Type:** Microsoft Windows
- **Version:** 11/2022

#### Pestaña Sistema

- **Graphic card:** VirtIO-GPU
- **Machine:** q35
- **BIOS:** OVMF (UEFI)
- **Add TPM:** Activado (requerido para Windows 11)
  - **Storage:** Selecciona un almacenamiento
- **EFI Storage:** Selecciona un almacenamiento
- **SCSI Controller:** VirtIO SCSI single
- **Qemu Agent:** Activado

#### Pestaña Discos

- **Bus/Device:** VirtIO Block
- **Storage:** Selecciona el almacenamiento para la VM
- **Disk size (GiB):** 64 (ajusta según necesites)
- **Cache:** Write back

#### Pestaña CPU

- **Sockets:** 1
- **Cores:** 2 (o más si es posible)
- **Type:** host

#### Pestaña Memoria

- **Memory (MiB):** 4096 (o más si es posible)
- **Minimum memory (MiB):** Deja en blanco o igual que Memory

#### Pestaña Red

- **Bridge:** vmbr0
- **Model:** VirtIO (paravirtualized)

#### Revisar y Finalizar

- Verifica toda la configuración y haz clic en **Finish**

### 3. Añadir ISO de Controladores VirtIO

1. Selecciona la VM recién creada
2. Ve a la pestaña **Hardware**
3. Haz clic en **Add → CD/DVD Drive**
4. Configura:
   - **Bus/Device:** IDE
   - **Storage:** Selecciona el almacenamiento donde está la ISO VirtIO
   - **ISO Image:** Selecciona la ISO de VirtIO
5. Haz clic en **Add**

### 4. Instalar Windows 11

1. Selecciona la VM y haz clic en **Start**
2. Haz clic en **Console** para acceder a la pantalla de la VM
3. Sigue las instrucciones de instalación de Windows 11

> **Nota importante:** Durante la instalación, cuando estés en la pantalla para seleccionar dónde instalar Windows, es probable que no se muestre ningún disco. Esto es normal porque necesitas cargar los controladores VirtIO:
>
> 1. Haz clic en **"Cargar controlador"**
> 2. Navega a la unidad del DVD con la ISO de VirtIO
> 3. Encuentra y selecciona los controladores en `vioscsi\amd64\Windows11`
> 4. Si se requiere, instala también los controladores de red desde `NetKVM\amd64\Windows11`

### 5. Configuración Post-Instalación

Una vez instalado Windows 11:

1. Instala los controladores VirtIO adicionales:
   - Ejecuta el instalador `virtio-win-gt-x64.msi` desde la ISO de VirtIO
2. Instala el Qemu Guest Agent:
   - En la ISO de VirtIO, navega a `guest-agent` y ejecuta el instalador adecuado

## Gestión de Máquinas Virtuales

### Operaciones Básicas

| Operación | Descripción |
|-----------|-------------|
| **Start** | Inicia la máquina virtual |
| **Shutdown** | Apaga correctamente el sistema operativo |
| **Stop** | Detiene la VM forzosamente (equivalente a desconectar la energía) |
| **Reset** | Reinicia la VM forzosamente (equivale a pulsar el botón reset) |
| **Suspend** | Pausa la VM y guarda su estado en RAM |
| **Hibernate** | Pausa la VM y guarda su estado en disco |
| **Clone** | Crea una copia de la VM |
| **Convert to Template** | Convierte la VM en una plantilla para nuevas VMs |

### Gestión de Recursos

Puedes modificar los recursos asignados a una VM incluso después de crearla:

1. Apaga la VM primero
2. Selecciona la VM
3. Ve a la pestaña **Hardware**
4. Selecciona el componente a modificar y haz clic en **Edit**
5. Realiza los cambios y haz clic en **OK**

## Solución de Problemas Comunes

### La VM de Windows 11 no inicia por requisitos de TPM

**Solución:** Asegúrate de haber habilitado TPM y UEFI durante la creación de la VM. Si no lo hiciste, puedes:

1. Hacer una copia de seguridad de tus datos
2. Crear una nueva VM con TPM habilitado
3. Reinstalar Windows 11

### Rendimiento lento en la VM

**Solución:**
1. Asegúrate de haber instalado todos los controladores VirtIO
2. Aumenta los recursos asignados (CPU, RAM)
3. Usa un tipo de almacenamiento más rápido si está disponible

### Sin conexión de red en la VM

**Solución:**
1. Verifica que el modelo de tarjeta de red sea VirtIO
2. Comprueba que has instalado los controladores de red desde la ISO VirtIO
3. Verifica la configuración de red en Proxmox (puente `vmbr0`)

## Recursos Adicionales

- [Documentación oficial de Proxmox VE](https://pve.proxmox.com/wiki/Main_Page)
- [Foros de Proxmox](https://forum.proxmox.com/)
- [Wiki de Proxmox](https://pve.proxmox.com/wiki/Main_Page)
