---
sidebar_position: 2
---


La seguridad de la API CloudFaster se basa en un esquema de autenticación por clave API.

### Flujo de Autenticación:

El cliente que desea consumir un endpoint protegido debe incluir la cabecera HTTP `X-API-Key` en su solicitud, conteniendo una clave API válida:

```
X-API-Key: tu_clave_api_aqui_muy_segura
```

1. FastAPI, a través de la dependencia `get_api_key` (definida en `app/api/auth.py`), intercepta esta cabecera.

2. La función `get_api_key` utiliza `db_service.verify_api_key()` para validar la clave.

3. `verify_api_key()` (en `app/services/db_service.py`) consulta la tabla `api_keys` de la base de datos:
   - Verifica que la clave exista.
   - Verifica que la clave esté habilitada (`enabled = TRUE`).
   - Verifica que la clave no haya expirado (comparando `expires_at` con la fecha actual, si `expires_at` no es NULL).

4. Si la clave es válida, `verify_api_key()` actualiza el campo `last_used` en la tabla `api_keys` y devuelve `True`. La solicitud procede al endpoint correspondiente.

5. Si la clave no se proporciona, es incorrecta, está deshabilitada o ha expirado, se lanza una `HTTPException` con código de estado 401 Unauthorized, y la solicitud no llega al endpoint.

### Gestión de Claves API:

- Las claves API se almacenan en la tabla `api_keys`.
- El script `app/db_init.py` crea una clave API inicial para el usuario admin con una validez de 365 días. Esta clave se imprime en la consola al ejecutar el script, facilitando las pruebas iniciales.
- El módulo `app/security.py` contiene la función `generate_api_key()` para crear nuevas claves criptográficamente seguras y `create_api_key_with_expiry()` que podría usarse para una futura gestión de claves (actualmente no hay endpoints para que los usuarios gestionen sus propias claves API a través de la API).