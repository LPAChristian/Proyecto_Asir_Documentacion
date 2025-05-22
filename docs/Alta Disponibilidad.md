
## Configuración de Alta Disponibilidad (HA)


Se crearán dos grupos de Alta Disponibilidad (HA) para gestionar la conmutación por error de las VMs críticas.


### Creación de Grupos de HA


1.  En la interfaz web de Proxmox, ir a `Datacenter` -> `HA`.
2.  Seleccionar la pestaña `Groups`.
3.  Hacer clic en `Create`.


    **Grupo 1: API (para nodos sv6 y sv7)**
    *   **ID / Name:** `API-HA`
    *   **Nodes:** Escribir `sv6,sv7` o seleccionar los nodos `sv6` y `sv7` de la lista. Marcar la casilla `restricted` si solo las VMs asignadas a este grupo pueden ejecutarse en estos nodos. Marcar `nofailback` si no se desea que las VMs vuelvan automáticamente a su nodo original una vez que esté disponible.
    *   **Comment:** `Grupo HA para VMs de API en sv6 y sv7`
    *   Hacer clic en `Create`.


    **Grupo 2: General (para nodos sv1-sv5 y sv8)**
    *   **ID / Name:** `General-HA`
    *   **Nodes:** Escribir `sv1,sv2,sv3,sv4,sv5,sv8` (o seleccionar los nodos).
    *   **Comment:** `Grupo HA para VMs generales en sv1-sv5 y sv8`
    *   Hacer clic en `Create`.


### Añadir VMs a HA y Establecer Prioridad


1.  En la interfaz web de Proxmox, ir a `Datacenter` -> `HA`.
2.  Seleccionar la pestaña `Resources`.
3.  Hacer clic en `Add`.
4.  **VM:** Seleccionar la máquina virtual (o plantilla, si se aplica HA a plantillas para futuros clones) que se desea añadir al grupo de HA.
5.  **Group:** Seleccionar el grupo de HA correspondiente (`API-HA` o `General-HA`).
6.  **Max Restart:** Número máximo de intentos de reinicio en caso de fallo (ej. `1`).
7.  **Max Relocate:** Número máximo de intentos de migración a otro nodo (ej. `1`).
8.  **Comment:** (Opcional) Añadir un comentario.
9.  Hacer clic en `Add`.


Repetir para todas las VMs que necesiten alta disponibilidad.


**Establecer Prioridad de Nodos (implícito en el orden del grupo):**
La prioridad de los nodos dentro de un grupo de HA está determinada por el orden en que se listan en la definición del grupo. Proxmox intentará mover la VM al siguiente nodo disponible en esa lista. Si se necesita un control más granular, se puede editar el grupo y reordenar los nodos. Por ejemplo, si en `General-HA` se listan `sv1,sv2,sv3,sv4,sv5,sv8`, Proxmox intentará primero `sv1`, luego `sv2`, y así sucesivamente.


## Configuración de Almacenamiento de Copias de Seguridad (NFS - backup)


Se utilizará un disco (asumimos `sdb`) del nodo `sv8` para crear un almacenamiento NFS dedicado a las copias de seguridad de todas las máquinas virtuales.


### Preparación del Servidor NFS para Backups (en sv8)


Estos pasos se realizan mediante la línea de comandos en `sv8` (IP: `192.168.1.248`). Asumimos que el disco es `/dev/sdb` y forma parte de uno de los RAID5 o es un disco independiente. Si es un RAID ya configurado, el path será diferente (ej. `/dev/md0`). Aquí usaremos `/dev/sdb` como ejemplo genérico de un disco.


1.  **Identificar y preparar el disco/RAID:**
    Si es un disco nuevo, particionar y formatear como se hizo para `DISCO-HA` (ver sección 5.1).
    ```bash
    # Ejemplo para un disco /dev/sdb
    sudo parted -s /dev/sdb mklabel gpt
    sudo parted -s -a optimal /dev/sdb mkpart primary 0% 100%
    sudo mkfs.ext4 /dev/sdb1
    ```
2.  **Crear punto de montaje para backups:**
    ```bash
    sudo mkdir /mnt/proxmox_backups
    ```
3.  **Montar el disco/partición:**
    ```bash
    sudo mount /dev/sdb1 /mnt/proxmox_backups # Usar la partición correcta
    ```
4.  **Hacer el montaje persistente (editar `/etc/fstab`):**
    Obtener UUID con `sudo blkid /dev/sdb1` y añadir a `/etc/fstab`:
    ```
    UUID=UUID_DEL_DISCO_BACKUP /mnt/proxmox_backups ext4 defaults 0 2
    ```
    Verificar: `sudo mount -a`.


5.  **Instalar el servidor NFS (si no está ya instalado):**
    ```bash
    sudo apt update
    sudo apt install -y nfs-kernel-server
    ```


6.  **Configurar la exportación NFS:**
    Editar `/etc/exports` y añadir:
    ```
    /mnt/proxmox_backups 192.168.1.0/24(rw,sync,no_subtree_check)
    ```


7.  **Aplicar la configuración y reiniciar el servicio:**
    ```bash
    sudo exportfs -a
    sudo systemctl restart nfs-kernel-server
    ```


### Añadir el Almacenamiento NFS para Backups en Proxmox (GUI)


Desde la interfaz web de cualquier nodo del clúster:


1.  Ir a `Datacenter` -> `Storage`.
2.  Hacer clic en `Add` -> `NFS`.
3.  Configurar los siguientes campos:
    *   **ID:** `backup_storage` (nombre para Proxmox).
    *   **Server:** `192.168.1.248` (IP del nodo `sv8`).
    *   **Export:** `/mnt/proxmox_backups` (la ruta exportada en `sv8`).
    *   **Content:** Seleccionar **SOLAMENTE** `VZDump backup file`.
    *   **Enable:** Asegurarse de que esté marcado.
    *   **Nodes:** Seleccionar `All` para que esté disponible para copias desde cualquier nodo.
    *   **Max Backups:** (Opcional) Definir cuántas copias de cada VM se conservarán en este almacenamiento.
4.  Hacer clic en `Add`.


Con esto, el almacenamiento `backup_storage` estará disponible para programar tareas de copia de seguridad para todas las VMs del clúster.

