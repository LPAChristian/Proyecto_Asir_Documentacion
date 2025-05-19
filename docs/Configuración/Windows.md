---
sidebar_position: 1
---

# Windows

Configuración de Windows
# Guía de Configuración de Seguridad para Windows VM

## Configuración de Cambio Obligatorio de Contraseña

### Paso 1: Acceso a la Gestión de Usuarios
1. **Inicie sesión** con credenciales administrativas en la VM de Windows
2. **Acceda a la consola de gestión** mediante la combinación `Win + R`
3. **Ejecute** el comando:
   ```
   lusrmgr.msc
   ```
   > Esto abrirá la herramienta de administración de Usuarios y Grupos Locales

### Paso 2: Configuración de Políticas de Seguridad
1. **Navegue** al directorio de usuarios:
   * Seleccione `Usuarios` en el panel de navegación izquierdo
   
2. **Localice la cuenta de usuario**:
   * Encuentre el usuario `Administrador` o la cuenta predeterminada asignada al cliente
   * Haga clic derecho → `Propiedades`

3. **Establezca la política de seguridad**:
   * Active la opción: `El usuario debe cambiar la contraseña en el siguiente inicio de sesión`
   * Confirme con `Aceptar`



## Resultados y Próximos Pasos

Una vez finalizada esta configuración, el sistema estará preparado para:

* Forzar al usuario a establecer credenciales personalizadas en su primer acceso
* Implementar una capa adicional de seguridad en el acceso a la VM
* Permitir la creación de plantillas (templates) estandarizadas para despliegues futuros

> **Nota de implementación**: Esta configuración es esencial para entornos donde se requiere cumplimiento normativo en materia de seguridad de acceso y establece las bases para una infraestructura Windows segura y personalizable.

