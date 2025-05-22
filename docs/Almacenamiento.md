---
sidebar_position: 6
---


## Configuración de Almacenamiento Compartido NFS (DISCO-HA)


Se utilizará el disco SSD de 1TB del nodo `sv5` para crear un recurso de almacenamiento compartido NFS llamado `DISCO-HA`, accesible por todos los nodos del clúster. Esto es útil para la alta disponibilidad (HA) de VMs.


### Preparación del Servidor NFS (en sv5)


Estos pasos se realizan mediante la línea de comandos en `sv5` (IP: `192.168.1.245`).


1.  **Identificar el disco:**
    ```bash
    sudo fdisk -l
    ```
    Identificar el disco de 1TB (ej. `/dev/sdb`).


2.  **Crear partición (si es necesario) y formatear:**
    Si el disco no está particionado, usar `fdisk` o `parted`. Por ejemplo, para crear una única partición GPT:
    ```bash
    sudo parted -s /dev/sdb mklabel gpt
    sudo parted -s -a optimal /dev/sdb mkpart primary 0% 100%
    ```
    Formatear la partición (ej. `/dev/sdb1`) con ext4:
    ```bash
    sudo mkfs.ext4 /dev/sdb1
    ```


3.  **Crear punto de montaje:**
    ```bash
    sudo mkdir /mnt/DISCO-HA
    ```


4.  **Montar el disco:**
    ```bash
    sudo mount /dev/sdb1 /mnt/DISCO-HA
    ```


5.  **Hacer el montaje persistente:**
    Obtener el UUID de la partición:
    ```bash
    sudo blkid /dev/sdb1
    ```
    Añadir la siguiente línea a `/etc/fstab` (reemplazar `UUID_DEL_DISCO` con el UUID obtenido):
    ```
    UUID=UUID_DEL_DISCO /mnt/DISCO-HA ext4 defaults 0 2
    ```
    Verificar montaje:
    ```bash
    sudo mount -a
    ```


6.  **Instalar el servidor NFS:**
    ```bash
    sudo apt update
    sudo apt install -y nfs-kernel-server
    ```


7.  **Configurar la exportación NFS:**
    Editar el archivo `/etc/exports` y añadir la siguiente línea (esto comparte directamente el punto de montaje; si se quisiera compartir una subcarpeta, se crearía y se especificaría esa ruta):
    ```
    /mnt/DISCO-HA 192.168.1.0/24(rw,sync,no_subtree_check)
    ```
    *   `rw`: Permite lectura y escritura.
    *   `sync`: Responde a las peticiones sólo después de que los cambios se hayan escrito en el disco.
    *   `no_subtree_check`: Deshabilita la comprobación de subárboles, lo que puede mejorar la fiabilidad.


8.  **Aplicar la configuración de exportación y reiniciar el servicio NFS:**
    ```bash
    sudo exportfs -a
    sudo systemctl restart nfs-kernel-server
    ```


### Añadir el Almacenamiento NFS en Proxmox (GUI)


Desde la interfaz web de cualquier nodo del clúster:


1.  Ir a `Datacenter` -> `Storage`.
2.  Hacer clic en `Add` -> `NFS`.
3.  Configurar los siguientes campos:
    *   **ID:** `DISCO-HA` (nombre para Proxmox).
    *   **Server:** `192.168.1.245` (IP del nodo `sv5`).
    *   **Export:** `/mnt/DISCO-HA` (la ruta exportada en `sv5`).
    *   **Content:** Seleccionar los tipos de contenido deseados (ej. `Disk image`, `ISO image`, `Container`). Para HA, `Disk image` es esencial.
    *   **Enable:** Asegurarse de que esté marcado.
    *   **Nodes:** Seleccionar `All` para que esté disponible en todos los nodos del clúster.
    *   Opciones avanzadas (NFS Version, etc.): Dejar por defecto a menos que haya requisitos específicos.
4.  Hacer clic en `Add`.


El nuevo almacenamiento `DISCO-HA` debería aparecer en la lista de almacenamientos y estar accesible desde todos los nodos.
