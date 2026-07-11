# CLAUDE.md — core-ui-design-system

## Constraints activos (auditoría de robustez)

- No modificar la API pública de componentes ya en producción sin justificar el breaking change
- Todo componente nuevo o modificado requiere test antes de mergear
- No agregar dependencias externas sin verificar antes en el propio repo si ya existe algo que cubra el caso
