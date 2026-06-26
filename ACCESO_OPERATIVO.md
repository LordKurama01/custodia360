# Acceso operativo inicial

La app queda preparada para ingreso único con Gmail y redirección por rol.

Mientras Supabase/Google OAuth no estén conectados con variables reales, el botón de ingreso permite entrar a la operación para trabajar y revisar el sistema sin enviar al usuario a una URL externa rota.

Variables:

- `NEXT_PUBLIC_LOCAL_ACCESS=true`: permite ingreso operativo inicial.
- `NEXT_PUBLIC_LOCAL_ACCESS=false` + Supabase real configurado: exige autenticación real.

No debe mostrarse texto de demo en la UI pública ni privada.
