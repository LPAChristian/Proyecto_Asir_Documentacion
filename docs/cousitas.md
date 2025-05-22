# Documentación de Infraestructura Proxmox: CLOUDFASTER


## Equipo de Infraestructura




## Introducción


A continuación, se detalla la configuración de los equipos físicos, la red, la instalación y configuración de Proxmox VE, la creación de máquinas virtuales y la configuración de alta disponibilidad y copias de seguridad para el entorno CLOUDFASTER.


## 1. Descripción de Nodos Físicos


Nuestra infraestructura se compone de 8 nodos servidores, con dos configuraciones de hardware distintas.


### 1.1. Nodos sv1 a sv7 (Características Homogéneas)


Estos siete nodos comparten una configuración de hardware y estado de recursos similar.


| Característica      | Especificación                                         |
| :------------------ | :----------------------------------------------------- |
| **Servidores**      | sv1, sv2, sv3, sv4, sv5, sv6, sv7                      |
| **IPs**             | 192.168.1.241 a 192.168.1.247                          |
| **CPU**             | 12 x AMD Ryzen 5 PRO 4650G with Radeon Graphics        |
| **Sockets CPU**     | 1 por nodo                                             |
| **Memoria RAM**     | 32 GiB por nodo                                        |
| **Almacenamiento Local** |                                                        |
|    Disco 1 (OS) | M.2 de 500GB (Proxmox y almacenamiento local)      |
|    Disco 2 (VMs) | SSD de 1TB (para máquinas virtuales o adicional) |
| **Versión Kernel**  | Linux 6.8.12-9-pve (Compilación: 2025-03-16T19:18Z)     |
| **Modo de Arranque**| EFI                                                    |


### 1.2. Nodo sv8 (Características Diferentes)


Este nodo presenta una configuración de hardware y estado de recursos diferente, destinado principalmente a tareas de almacenamiento y respaldo.


| Característica      | Especificación                                       |
| :------------------ | :--------------------------------------------------- |
| **Servidor**        | sv8                                                  |
| **IP**              | 192.168.1.248                                        |
| **CPU**             | 16 x Intel(R) Xeon(R) CPU E5530 @ 2.40GHz            |
| **Sockets CPU**     | 2                                                    |
| **Memoria RAM**     | 16 GiB                                               |
| **Almacenamiento Local** | Dos RAID5 de 10TB cada uno                         |
| **Versión Kernel**  | Linux 6.8.12-10-pve (Compilación: 2025-04-18T07:39Z)  |
| **Modo de Arranque**| EFI                                                  |


## 2. Configuración de Red


*   **Segmento de Red:** `192.168.1.0/24`
*   **Switches:** Se han implementado 2 switches Cisco Catalyst 2960-S.
*   **Configuración:** Los switches están configurados para permitir la coexistencia y comunicación entre la red de nuestra infraestructura Proxmox y la red general de la clase, facilitando el acceso y la operatividad del entorno.


## 3. Instalación de Proxmox VE


Cada uno de los 8 nodos tiene instalado Proxmox VE.


### 3.1. Preparación del Medio de Instalación


1.  **Descargar la ISO de Proxmox VE:** Obtener la última imagen ISO estable desde el [sitio oficial de Proxmox](https://www.proxmox.com/en/downloads).
2.  **Crear USB Booteable:** Utilizar una herramienta como [Rufus](https://rufus.ie/) para grabar la imagen ISO en una unidad flash USB.
    *   En Rufus, seleccionar la unidad USB.
    *   Seleccionar la imagen ISO de Proxmox VE.
    *   Asegurarse de que el esquema de partición sea **GPT** y el sistema de destino sea **UEFI (no CSM)**, ya que Proxmox VE se instalará en modo UEFI.
    *   Hacer clic en "Empezar".


### 3.2. Consideraciones BIOS/UEFI


Es crucial instalar Proxmox VE en modo **UEFI**. Las BIOS tradicionales (Legacy) a menudo no son interactivas de la manera que Proxmox requiere durante su instalación, especialmente para la selección de discos y configuración de red avanzada. UEFI proporciona una interfaz más moderna y flexible. Asegúrate de que el modo de arranque en la configuración UEFI/BIOS de cada servidor esté configurado para "UEFI Only" o "UEFI First".


### 3.3. Pasos de Instalación de Proxmox VE (por nodo)


1.  **Arrancar desde USB:** Conectar la unidad flash USB al servidor y arrancarlo. Acceder al menú de arranque (normalmente presionando F11, F12, ESC o DEL durante el inicio) y seleccionar la unidad USB UEFI.
2.  **Pantalla de Bienvenida:** Seleccionar "Install Proxmox VE".
3.  **Acuerdo de Licencia (EULA):** Leer y aceptar el acuerdo de licencia haciendo clic en "I agree".
4.  **Selección de Disco de Destino:**
    *   El instalador mostrará los discos disponibles.
    *   Seleccionar el disco **M.2 de 500GB** para la instalación del sistema operativo Proxmox.
    *   Hacer clic en "Options" si se desea personalizar el sistema de archivos (por defecto es ext4, ZFS es una opción avanzada). Para esta configuración, ext4 es adecuado.
    *   Hacer clic en "Next".
5.  **Configuración Regional:**
    *   Seleccionar País (Country), Zona Horaria (Time zone) y Distribución del Teclado (Keyboard Layout).
    *   Hacer clic en "Next".
6.  **Contraseña y Correo Electrónico:**
    *   Establecer una contraseña segura para el usuario `root`.
    *   Ingresar una dirección de correo electrónico para notificaciones del sistema.
    *   Hacer clic en "Next".
7.  **Configuración de Red:**
    *   La interfaz de red se seleccionará automáticamente (asegurarse de que sea la correcta).
    *   **Hostname (FQDN):** Por ejemplo, `sv1.proxmox.local` (ajustar para cada servidor: sv2.proxmox.local, etc.).
    *   **IP Address (CIDR):** Asignar la IP estática correspondiente al nodo (ej. `192.168.1.241/24` para sv1).
    *   **Gateway:** La puerta de enlace de la red (ej. `192.168.1.1`).
    *   **DNS Server:** El servidor DNS de la red (ej. `192.168.1.1` o `8.8.8.8`).
    *   Hacer clic en "Next".
8.  **Resumen e Instalación:** Revisar el resumen de la configuración. Si todo es correcto, hacer clic en "Install".
9.  **Finalización:** La instalación comenzará. Una vez completada, el sistema se reiniciará automáticamente. Retirar la unidad USB.
10. **Acceso a la Interfaz Web:** Después del reinicio, acceder a la interfaz web de Proxmox VE desde un navegador en la misma red: `https://IP_DEL_NODO:8006`. Iniciar sesión con el usuario `root` y la contraseña establecida.


Repetir estos pasos para cada uno de los 8 nodos, asignando las IPs correspondientes (`192.168.1.241` para sv1, `192.168.1.242` para sv2, ..., `192.168.1.248` para sv8).


## 4. Creación del Cluster Proxmox (CLOUDFASTER)


Una vez que Proxmox VE está instalado en todos los nodos, se procede a unirlos en un único clúster llamado `CLOUDFASTER`.


### 4.1. Crear el Cluster en el Primer Nodo (ej. sv1)


1.  Acceder a la interfaz web de `sv1` (`https://192.168.1.241:8006`).
2.  En el menú de la izquierda, seleccionar `Datacenter`.
3.  En el panel central, seleccionar la opción `Cluster`.
4.  Hacer clic en el botón `Create Cluster`.
5.  **Cluster Name:** Ingresar `CLOUDFASTER`.
6.  **Link 0 Address:** Asegurarse de que la IP seleccionada sea la de la red `192.168.1.0/24` (ej. `192.168.1.241`).
7.  Hacer clic en `Create`. El nodo `sv1` ahora es el primer miembro del clúster.


### 4.2. Unir los Nodos Restantes al Cluster


1.  **En `sv1` (el primer nodo):**
    *   Ir a `Datacenter` -> `Cluster`.
    *   Hacer clic en el botón `Join Information`.
    *   Se abrirá una ventana con la información necesaria para unir otros nodos. Hacer clic en `Copy Information`.


2.  **En cada uno de los nodos restantes (sv2 a sv8):**
    *   Acceder a la interfaz web del nodo a unir (ej. `https://192.168.1.242:8006` para `sv2`).
    *   Ir a `Datacenter` -> `Cluster`.
    *   Hacer clic en el botón `Join Cluster`.
    *   **Information:** Pegar la información copiada del nodo `sv1`.
    *   **Password:** Ingresar la contraseña `root` del nodo `sv1` (el nodo que creó el clúster).
    *   **Link 0 Address:** Asegurarse de que la IP seleccionada sea la de la red `192.168.1.0/24` correspondiente a *este* nodo (ej. `192.168.1.242` para `sv2`).
    *   Hacer clic en `Join 'CLOUDFASTER'`.
    *   El proceso tomará unos momentos. La ventana de la consola del nodo mostrará el progreso. Una vez finalizado, el nodo se reiniciará o recargará su configuración y aparecerá en el clúster.


3.  **Verificación:** Después de unir todos los nodos, desde la interfaz web de cualquier nodo del clúster, se deberían ver todos los servidores listados bajo `Datacenter`.


## 5. Configuración de Almacenamiento Compartido NFS (DISCO-HA)


Se utilizará el disco SSD de 1TB del nodo `sv5` para crear un recurso de almacenamiento compartido NFS llamado `DISCO-HA`, accesible por todos los nodos del clúster. Esto es útil para la alta disponibilidad (HA) de VMs.


### 5.1. Preparación del Servidor NFS (en sv5)


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


### 5.2. Añadir el Almacenamiento NFS en Proxmox (GUI)


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


## 6. Creación de Máquinas Virtuales (VMs)


Se crearán las siguientes máquinas virtuales. Explicaremos el proceso para una y será similar para las demás.


*   Windows 11 (W11)
*   Windows Server 2025 (WServer2025)
*   Windows Server 2022 (WServer2022)
*   Ubuntu Server
*   Fedora
*   Red Hat Enterprise Linux (RHEL)


### 6.1. Pasos para Crear una Máquina Virtual (Ejemplo: Windows 11)


1.  En la interfaz web de Proxmox, hacer clic en `Create VM` (botón azul en la esquina superior derecha).
2.  **Pestaña General:**
    *   **Node:** Seleccionar el nodo donde se alojará inicialmente la VM (ej. `sv1`).
    *   **VM ID:** Asignar un ID único (ej. `151` para W11 en `sv1`, según la tabla de IDs).
    *   **Name:** Dar un nombre descriptivo (ej. `W11-Base`).
    *   Dejar el resto por defecto o según necesidad. Hacer clic en `Next`.
3.  **Pestaña OS:**
    *   Seleccionar "Use CD/DVD disc image file (ISO)".
    *   **Storage:** Elegir `local` (o donde se haya subido la ISO) o el NFS `DISCO-HA` si las ISOs están allí.
    *   **ISO Image:** Seleccionar la imagen ISO de Windows 11.
    *   **Guest OS Type:** `Microsoft Windows`.
    *   **Version:** `11/2022`.
    *   Hacer clic en `Next`.
4.  **Pestaña System:**
    *   **Graphic card:** `Default`.
    *   **Machine:** `q35` (por defecto).
    *   **BIOS:** `OVMF (UEFI)`. Es importante para Windows 11.
    *   **EFI Storage:** Seleccionar un almacenamiento para el disco EFI (ej. `local-lvm` o el NFS `DISCO-HA`).
    *   **Add TPM:** Marcar esta casilla. Seleccionar un almacenamiento para el TPM (ej. `local-lvm` o `DISCO-HA`). **TPM 2.0 es un requisito para Windows 11.**
    *   **SCSI Controller:** Seleccionar `VirtIO SCSI` (recomendado para mejor rendimiento).
    *   **Qemu Agent:** Marcar esta casilla (permite mejor interacción entre el host y la VM).
    *   Hacer clic en `Next`.
5.  **Pestaña Disks:**
    *   **Bus/Device:** `SCSI` (ya que elegimos VirtIO SCSI controller).
    *   **Storage:** Seleccionar dónde se almacenará el disco virtual (ej. `DISCO-HA` para flexibilidad o `local-lvm` del nodo).
    *   **Disk size (GiB):** Establecer el tamaño (ej. `64`).
    *   **SSD emulation:** Marcar si el almacenamiento subyacente es SSD (mejora el rendimiento).
    *   Hacer clic en `Next`.
6.  **Pestaña CPU:**
    *   **Sockets:** `1` (o más según necesidad).
    *   **Cores:** `2` (o más, ej. 4 para Windows 11).
    *   **Type:** `host` (si los CPUs de los nodos son homogéneos o se quiere el máximo rendimiento y compatibilidad de características). Si hay heterogeneidad y se planea migración en vivo, un tipo más genérico como `kvm64` podría ser necesario.
    *   Hacer clic en `Next`.
7.  **Pestaña Memory:**
    *   **Memory (MiB):** Asignar RAM (ej. `4096` para 4GB, recomendable `8192` para W11).
    *   Hacer clic en `Next`.
8.  **Pestaña Network:**
    *   **Bridge:** `vmbr0` (o el bridge de red principal).
    *   **Model:** `VirtIO (paravirtualized)` (recomendado para mejor rendimiento).
    *   Hacer clic en `Next`.
9.  **Pestaña Confirm:**
    *   Revisar todas las configuraciones.
    *   Si se desea iniciar la VM después de crearla, marcar "Start after created".
    *   Hacer clic en `Finish`.


### 6.2. Consideración Especial para Windows 11 (Drivers VirtIO)


Para Windows (especialmente Windows 11), es necesario cargar los drivers VirtIO durante la instalación si se utiliza el controlador VirtIO SCSI o la tarjeta de red VirtIO, ya que no están incluidos por defecto.


1.  **Descargar ISO de drivers VirtIO:** Obtener la ISO estable más reciente desde [Fedora VirtIO Drivers](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/).
2.  **Subir la ISO a Proxmox:** Subir la ISO de drivers VirtIO a un almacenamiento de Proxmox (ej. `local` en la sección ISO Images).
3.  **Añadir un segundo CD/DVD Drive a la VM:**
    *   Una vez creada la VM (antes de iniciarla por primera vez o durante la instalación), ir a la sección `Hardware` de la VM.
    *   Hacer clic en `Add` -> `CD/DVD Drive`.
    *   **Storage:** Seleccionar donde está la ISO de VirtIO.
    *   **ISO Image:** Seleccionar la ISO de `virtio-win.iso`.
    *   Hacer clic en `Add`.
4.  **Durante la instalación de Windows:**
    *   Cuando llegue al paso de "¿Dónde quieres instalar Windows?" y no aparezcan discos, hacer clic en "Cargar controlador".
    *   Hacer clic en "Examinar".
    *   Navegar al CD/DVD que contiene los drivers VirtIO. Para el disco SCSI, buscar en `viostor\[version]\w11\amd64` (o la arquitectura y versión de Windows correspondiente).
    *   Seleccionar el controlador y hacer clic en "Siguiente". El disco debería aparecer.
    *   Si la red tampoco funciona después de la instalación, instalar los drivers de red VirtIO (`NetKVM`) desde el Administrador de Dispositivos, apuntando a la misma ISO.


Para las demás VMs (WServer2025, WServer2022, Ubuntu-Server, Fedora, Redhat), el proceso es similar, ajustando el tipo de OS, versión, recursos (CPU, RAM, disco) y la ISO correspondiente. Todas usarán `SCSI` para los discos.


## 7. Configuración Post-Instalación de VMs: Forzar Cambio de Contraseña


Una vez instaladas las máquinas virtuales, se configurará cada una para que el usuario deba cambiar su contraseña en el primer inicio de sesión. Esto se hará desde un usuario con privilegios suficientes, pero no el administrador principal si es posible (o usando `sudo`).


### 7.1. Windows (Interfaz Gráfica)


Esto se aplica a W11, WServer2025, WServer2022. Se asume que se ha creado un usuario estándar además del Administrador. Si se quiere forzar para el propio Administrador, se puede hacer, pero es menos común.


1.  Iniciar sesión en la VM de Windows con una cuenta de administrador.
2.  Abrir "Administración de equipos": presionar `Win + R`, escribir `lusrmgr.msc` y presionar Enter.
3.  Navegar a `Usuarios y grupos locales` -> `Usuarios`.
4.  Hacer clic derecho sobre la cuenta de usuario para la que se quiere forzar el cambio de contraseña (ej. `UsuarioFinal`). Seleccionar `Propiedades`.
5.  En la pestaña `General`, marcar la casilla: **"El usuario debe cambiar la contraseña en el siguiente inicio de sesión"**.
6.  Desmarcar "La contraseña nunca caduca" si estuviera marcada.
7.  Hacer clic en `Aplicar` y luego en `Aceptar`.


### 7.2. Ubuntu Server (Línea de Comandos)


Se asume que durante la instalación de Ubuntu Server se creó un usuario (ej. `ubuntuuser`) y se desea forzar el cambio de contraseña para `root` (aunque es mejor trabajar con usuarios estándar y `sudo`) o para otro usuario. El prompt original indica forzar para `root` y luego borrar un usuario `root1`. Esto es un poco inusual, ya que `root` es la cuenta superusuario.


**Escenario 1: Forzar cambio de contraseña para `root` y eliminar un usuario de instalación (ej. `root1`)**


1.  Iniciar sesión en la VM Ubuntu Server con el usuario creado durante la instalación (ej. `root1` o el nombre que se le haya dado, que tiene permisos `sudo`).
2.  **Establecer una contraseña temporal para `root` (si no tiene o se desconoce):**
    ```bash
    sudo passwd root
    ```
    Ingresar una contraseña temporal segura.
3.  **Forzar el cambio de contraseña para `root` en el siguiente inicio de sesión:**
    ```bash
    sudo chage -d 0 root
    ```
    Esto establece la fecha del último cambio de contraseña a 0 (Epoch), lo que obliga a cambiarla.
4.  **Eliminar el usuario de instalación (ej. `root1`), si ya no es necesario:**
    *   Asegurarse de que `root` está habilitado y se puede iniciar sesión con él, o que existe otro usuario administrador.
    *   Si se está logueado como `root1` y se quiere eliminar `root1`, primero hay que cerrar sesión y loguearse como `root` u otro usuario.
    *   Si se está logueado como `root` o como otro administrador:
        ```bash
        sudo userdel -r root1
        ```
        La opción `-r` elimina también el directorio home del usuario.


**Escenario 2: Forzar cambio de contraseña para un usuario estándar (ej. `usuariofinal`)**


1.  Iniciar sesión con un usuario con privilegios `sudo`.
2.  Forzar el cambio de contraseña para `usuariofinal`:
    ```bash
    sudo chage -d 0 usuariofinal
    ```


## 8. Identificadores de VM (VM IDs)


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


*Nota: El prompt original solo listaba IDs hasta sv5. He extrapolado para sv6, sv7 y sv8 siguiendo el patrón. Ajustar si es diferente.*
*Nota 2: Los nombres "OS.UBUNTU24_CLIENT", "OS.UBUNTU24_SERVER", "Sistema operativo FEDORA", "SO.REDHAT" etc., son descriptivos. En la tabla se han abreviado para claridad.*


## 9. Conversión de VMs a Plantillas (Templates)


Una vez que las VMs base están instaladas, actualizadas y configuradas (incluyendo la instalación de Qemu Agent y drivers VirtIO), se convierten en plantillas para facilitar el despliegue rápido de nuevas instancias.


1.  **Apagar la VM:** Asegurarse de que la VM que se va a convertir en plantilla esté completamente apagada.
2.  **Seleccionar la VM:** En la interfaz web de Proxmox, hacer clic derecho sobre la VM deseada en el árbol de navegación de la izquierda.
3.  **Convertir a Plantilla:** Seleccionar la opción `Convert to template`.
4.  **Confirmar:** Confirmar la acción. El icono de la VM cambiará, indicando que ahora es una plantilla.


Las plantillas no se pueden iniciar directamente, pero se pueden clonar para crear nuevas VMs (clon completo o clon enlazado).


## 10. Configuración de Alta Disponibilidad (HA)


Se crearán dos grupos de Alta Disponibilidad (HA) para gestionar la conmutación por error de las VMs críticas.


### 10.1. Creación de Grupos de HA


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


### 10.2. Añadir VMs a HA y Establecer Prioridad


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


## 11. Configuración de Almacenamiento de Copias de Seguridad (NFS - backup)


Se utilizará un disco (asumimos `sdb`) del nodo `sv8` para crear un almacenamiento NFS dedicado a las copias de seguridad de todas las máquinas virtuales.


### 11.1. Preparación del Servidor NFS para Backups (en sv8)


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


### 11.2. Añadir el Almacenamiento NFS para Backups en Proxmox (GUI)


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


---


Esta documentación cubre los aspectos solicitados para la configuración de la infraestructura Proxmox.
content_copy
download
Use code with caution.Markdown



