---
sidebar_position: 6
---

# Proxmox

# Instalación y Uso de Proxmox VE  
**Yeray y Teleco**

---

## Introducción
**Proxmox VE (Virtual Environment)** es una plataforma de virtualización de código abierto basada en Debian, que permite crear y administrar máquinas virtuales (KVM) y contenedores (LXC) desde una interfaz web muy completa.

---

## Requisitos Previos

### Requisitos de Hardware

#### 🖥️ Información General del Servidor Proxmox
- **Versión de Proxmox VE:** 8.4.1  
- **Nodo:** sv1  
- **Versión del kernel:** Linux 6.8.12-9-pve *(compilado el 2025-03-16)*  
- **Modo de arranque:** EFI  
- **Versión del administrador:** pve-manager/8.4.0/ec58e45e1bcdf2ac  
- **Repositorio:** Enterprise habilitado *(requiere suscripción válida)*  

#### ⚙️ Especificaciones del Hardware
- **CPU:** 16 núcleos (2 sockets) — Intel Xeon E5530 @ 2.40GHz  
- **RAM:** 15.62 GiB  
- **Swap:** 8.00 GiB  
- **Disco:** 93.93 GiB *(con 2.79 GiB usados)*  

#### 🌐 Configuración de Red

| Nombre | Tipo | Activa | Autostart | VLAN | Puertos/Esclavos | CIDR | Puerta de Enlace |
|--------|------|--------|-----------|------|------------------|------|------------------|
| eno1   | Network Device | Sí | No | No | - | - | - |
| eno2   | Network Device | No | No | No | - | - | - |
| vmbr0  | Linux Bridge   | Sí | Sí | No | eno1 | 192.168.52.241/24 | 192.168.52.1 |

- **DISCOS PARA WINDOWS 11 →** Formato COW2  
- **Virtualización habilitada en BIOS (VT-x / AMD-V):** ✅  

---

## Requisitos de Software
- Imagen ISO de Proxmox VE: **Proxmox VE 8.4 ISO**  
- USB booteable *(creado con Rufus, Balena Etcher, etc.)*

---

## Instalación de Proxmox VE

### 1. Preparar USB con Proxmox VE ISO
- Usar **Rufus** para crear un USB booteable con la ISO de Proxmox VE.

### 2. Instalar Proxmox
- Insertar el USB y arrancar desde él.
- Seleccionar **Install Proxmox VE**.
- Aceptar el acuerdo de licencia.
- Elegir el disco de destino.
- Configurar:
  - Zona horaria
  - Contraseña del usuario `root`
  - Dirección IP estática *(recomendada)*
- Finalizar instalación y reiniciar.

---

## 4. Componentes Principales de Proxmox VE
Según el datasheet oficial de **Proxmox VE 8.4**:

- Kernel optimizado basado en **Linux 6.5**
- **KVM/QEMU** para virtualización completa (máquinas virtuales)
- **LXC** para contenedores ligeros
- **ZFS, LVM, Ceph** para almacenamiento avanzado
- Gestión vía **Web GUI, CLI y REST API**
- **Proxmox Backup Server (opcional)** para respaldos automáticos
- **Proxmox VE Cluster** para alta disponibilidad
- **Firewall y VLANs integradas** para seguridad

---

## Pasos para Crear la Máquina Virtual

### 1. Acceder a la Interfaz Web de Proxmox VE
- Abre tu navegador y dirígete a la dirección IP de tu servidor Proxmox VE.

### 2. Crear una Nueva Máquina Virtual
- En el panel derecho, haz clic en **"Create VM"**

#### Configuración General
- **Node:** Selecciona el nodo donde se creará la VM.
- **VM ID:** Deja el valor predeterminado o asigna uno manualmente.
- **Name:** Escribe un nombre descriptivo, por ejemplo: `Windows11`.

#### Configuración del Sistema Operativo (OS)
- **ISO Image:** Selecciona la imagen ISO de Windows 11 que subiste previamente.
- **Guest OS Type:** Elige `Microsoft Windows`.
- **Version:** Selecciona `11/2022`.

#### Configuración del Sistema (System)
- **TPM:** Activa "Add TPM" para cumplir con los requisitos de Windows 11.
- **EFI:** Marca "Use UEFI".
- **Qemu Agent:** Activa esta opción para mejorar la integración entre host y VM.
- **SCSI Controller:** Selecciona `VirtIO SCSI`.

#### Configuración del Disco Duro (Hard Disk)
- **Bus/Device:** Elige `VirtIO Block`.
- **Storage:** Selecciona el almacenamiento correspondiente.
- **Disk size:** Asigna el tamaño deseado (ej. 64 GB).

#### Configuración de la CPU
- **Cores:** Asigna núcleos (ej. 2).
- **Type:** Selecciona `host`.

#### Configuración de la Memoria (Memory)
- **Memory (MiB):** Asigna RAM (ej. 4096 para 4 GB).

#### Configuración de la Red (Network)
- **Bridge:** Selecciona `vmbr0` o el puente de red correspondiente.
- **Model:** Elige `VirtIO (paravirtualized)`.

#### Confirmar y Finalizar
- Revisa todas las configuraciones y haz clic en **"Finish"** para crear la VM.

---

## 📀 Añadir la ISO de Controladores VirtIO

### Agregar una Segunda Unidad de CD/DVD
1. Selecciona la VM recién creada.
2. Ve a la pestaña **"Hardware"** > clic en **"Add" > "CD/DVD Drive"**.
3. En **Bus/Device**, selecciona `IDE`.
4. En **Storage**, elige el almacenamiento ISO.
5. En **ISO Image**, selecciona la imagen ISO de **VirtIO**.
6. Haz clic en **"Add"**.

---

## 🚀 Iniciar la Máquina Virtual

### Iniciar la VM
- Selecciona la VM y haz clic en **"Start"**.

### Acceder a la Consola
- Haz clic en **"Console"** para ver la pantalla de instalación de Windows 11.

---

## 🧩 Instalar Windows 11

### Proceso de Instalación
1. Sigue los pasos habituales hasta llegar a la pantalla donde se selecciona el disco de instalación.

### Cargar Controladores
- Si no aparece ningún disco:
  - Haz clic en **"Cargar controlador"**.
  - Selecciona la unidad correspondiente a la ISO de VirtIO.
  - Navega a `vioscsi\amd64\Windows11` y carga el controlador.
  - Repite el proceso para la tarjeta de red si es necesario, navegando a `NetKVM\amd64\Windows11`.

### Continuar con la Instalación
- Una vez cargados los controladores, el disco debería aparecer.
- Selecciónalo y continúa con la instalación de Windows 11.

