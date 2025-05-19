---
sidebar_position: 2
---

# Ubuntu

# Guía de Configuración de Template Ubuntu para Proxmox

## Configuración de Seguridad para Templates Ubuntu

### Paso 1: Gestión de Usuarios
####  Creación de Usuario Temporal

```bash
sudo adduser usuario_temporal
```

* Utilice el usuario creado durante la instalación o cree uno nuevo
* Asigne una contraseña temporal
* Los campos adicionales pueden dejarse en blanco (opcional)

### Paso 2: Configuración de Privilegios
####  Asignación de Permisos Administrativos

```bash
sudo usermod -aG sudo usuario_temporal
```

* Este comando otorga privilegios de superusuario (sudo) al usuario temporal
* Permite realizar tareas administrativas necesarias para la configuración

### Paso 3: Activación del Usuario Root
#### Habilitación y Configuración de Root

```bash
sudo passwd root
```

> **Nota técnica**: En distribuciones Ubuntu estándar, el usuario root está deshabilitado por defecto como medida de seguridad.

* Ingrese y confirme la nueva contraseña para el usuario root
* Asegúrese de utilizar una contraseña segura según la política de contraseñas corporativa

### Paso 4: Cambio de Sesión
#### Acceso con Usuario Root

1. Cierre la sesión del usuario temporal:
   ```bash
   exit
   ```

2. Inicie sesión con el usuario root:
   ```bash
   usuario: root
   contraseña: [contraseña configurada anteriormente]
   ```

> **Alternativa para consola Proxmox**: Si está accediendo mediante la consola de Proxmox, puede cambiar al usuario root con:
> ```bash
> su -
> ```

### Paso 5: Limpieza de Sistema
#### Eliminación del Usuario Temporal

```bash
userdel -r usuario_temporal
```

* El parámetro `-r` asegura la eliminación completa del directorio home y archivos de correo
* Verifique que no queden archivos residuales del usuario

### Paso 6: Implementación de Política de Seguridad
#### Configuración de Cambio Obligatorio de Contraseña

```bash
passwd -e root
```

* Este comando establece la expiración inmediata de la contraseña de root
* Fuerza al usuario a establecer una nueva contraseña en el próximo inicio de sesión
* Cumple con buenas prácticas de seguridad para credenciales iniciales

### Paso 7: Preparación del Template
#### Finalización y Conversión

1. Apague la máquina virtual:
   ```bash
   shutdown -h now
   ```

2. **Desde la interfaz gráfica de Proxmox**:
   * Localice la VM en el panel de navegación
   * Haga clic derecho sobre la VM 
   * Seleccione **Convertir en template**

##  Consideraciones Finales

El template resultante estará configurado para:

* Solicitar cambio de contraseña en el primer inicio de sesión
* Eliminar usuarios temporales de configuración
* Mantener un entorno limpio y seguro para despliegues

Esta configuración garantiza que cada cliente que cree una instancia a partir de este template pueda establecer sus propias credenciales de acceso seguras desde el primer uso.

