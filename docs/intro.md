---
sidebar_position: 1
---

# Resumen del proyecto 


---


### ÍNDICE

#### Visión general  
 Plataforma web para despliegue automatizado de servicios (contenedores/máquinas)

#### Puntos Clave  
1. Introducción  
2. Tecnología base  
3. Arquitectura del sistema  
4. Estructura de APIs  
5. Flujo de funcionamiento  
6. Puntos de discusión

---

## Introducción

### Objetivo

Crear una plataforma automatizada que permita a usuarios solicitar y recibir entornos de desarrollo y producción en cuestión de minutos.


## El Problema

El proceso tradicional de configuración de servidores es manual, lento y requiere conocimientos técnicos avanzados.

---
## Tecnología Base

**Proxmox VE**  
- Licencia: GNU AGPLv3 [(código abierto)](https://www.gnu.org/licenses/agpl-3.0.en.html) 
- Hipervisor KVM para máquinas virtuales completas  
- Gestión de contenedores LXC  
- API REST completa  


**Docker Engine**  
- Licencia: Apache License 2.0 [(código abierto) ](https://www.apache.org/licenses/LICENSE-2.0)
- Contenedores ligeros y portables  
- Despliegue rápido y consistente  
- Aislamiento efectivo de aplicaciones  


---

## Arquitectura del Sistema

- Servidor físico con Proxmox VE como capa base de virtualización  
- Máquina virtual dedicada dentro de Proxmox funcionando como servidor Docker  
- Contenedores Docker para servicios web de usuarios y otros servicios ligeros  
- Máquinas virtuales para servicios que requieren recursos dedicados o sistemas completos


## Estructura de APIs


<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ flex: 1, paddingRight: '1rem' }}>
   
    <p>
      - API Docker: Gestión de contenedores  
      - API Proxmox: Gestión de máquinas virtuales  
      - API Intermediaria: Punto único de entrada para peticiones del frontend  
    </p>
  </div>
  <div style={{ flex: 1 }}>
    <img src={require('./apis.png').default} alt="Descripción" style={{ maxWidth: '100%', height: 'auto' }} />
  </div>
</div>



> Ejemplo de estructura JSON para API Intermediaria:  
```
{
"user_id": "12345",
"username": "usuario_ejemplo",
"service_type": "docker", // o "vm"
"service_format": "web", // u otros servicios
"storage_gb": 10,
"ram_mb": 512,
"additional_requirements": {}
}
```
---


## Flujo de Funcionamiento

### 1. Solicitud Inicial del Usuario
- El usuario accede a la plataforma web  
- Solicita un “Servicio Web”  
- Completa un formulario especificando:
  - Nombre  
  - Archivos a publicar  
  - Recursos necesarios  
  

### 2. Procesamiento Frontend
- Se valida la entrada del usuario  
- Se genera una petición con formato JSON estructurado

### 3. API Intermediaria (FastAPI en Python)
- Valida la estructura y los datos  
- Determina que es una solicitud de tipo "web" en Docker  
- Prepara los datos para la API de Docker  
- Registra la solicitud en logs

### 4. API Docker (FastAPI en Python)
- Usa Docker SDK para Python  
- Selecciona imagen base (ej. `httpd` para Apache)  
- Crea Dockerfile temporal  
- Guarda el HTML del usuario  
- Construye imagen Docker personalizada  
- Despliega contenedor


### 5. Gestión de Red y DNS

- Asigna puerto único al contenedor  
- Nginx (proxy inverso) se actualiza dinámicamente  
- Se configura un virtual host nuevo  
- DNS interno se actualiza para subdominio nuevo



### 6. Certificados SSL

- Script automatizado con Let's Encrypt (Certbot)  
- Obtiene certificado SSL para subdominio  
- Configura Nginx con HTTPS



### 7. Base de Datos y Gestión

- La API Intermediaria genera un ID único para el servicio  
- Guarda datos en BD: ID del servicio, usuario, tipo, etc.  
- Devuelve respuesta en JSON al frontend



### 8. Respuesta al Usuario

- Frontend muestra URL del sitio, estado, etc.



### 9. Acceso del Usuario Final

El usuario accede a: `usuario-ejemplo.dominio.com`  
- DNS resuelve al servidor Nginx  
- Nginx redirige a contenedor correspondiente  
- El contenedor Apache sirve contenido HTML

---

## Puntos de Discusión

### Gestión de Enlaces e IDs

- ¿Cómo relacionar clientes con máquinas activas?  
- Backend devuelve ID, frontend lo guarda  
- Almacenamiento dual: frontend y backend  
- ¿BD compartida o sincronizada?

---


### Distribución del Trabajo

#### Infraestructura física y redes
- Configurar red local y acceso remoto  
- Gestionar conectividad entre servicios  
- Gestionar recursos físicos (espacio, RAM, CPU, etc.)  
- **Objetivo:** Preparación del entorno físico (servidor, red, etc.)

#### Docker & Dockerfiles
- Crear imágenes personalizadas  
- Optimizar capas y volúmenes  
- Documentar cómo construir/iniciar contenedores  
- **Objetivo:** Diseñar y probar Dockerfiles para los servicios

#### APIs
- Investigar endpoints relevantes  
- Diseñar sistema para interactuar con APIs  
- Realizar pruebas y documentar  
- **Objetivo:** Implementar y documentar APIs necesarias

#### Documentación técnica y presentación
- Redactar guías de instalación, uso y mantenimiento  
- Diseñar esquemas de arquitectura  
- Preparar slides y materiales  
- **Objetivo:** Documentar todo el proceso y preparar la presentación




