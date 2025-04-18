# Archivo Cultural

## Descripción

Archivo Cultural es una aplicación web para centralizar y organizar recursos digitales culturales. La plataforma permite almacenar, gestionar y acceder a múltiples formatos de archivo como imágenes (PNG, JPG), documentos (PDF, Word, Excel, PowerPoint), archivos multimedia (MP4, MP3) y texto plano.

## Propósito

Esta aplicación está diseñada para preservar y compartir recursos relacionados con culturas populares e indígenas, facilitando la gestión de archivos digitales para instituciones culturales y dependencias gubernamentales.

## Características principales

* **Almacenamiento local:** Utiliza IndexedDB para guardar archivos directamente en el navegador del usuario.
* **Interfaz intuitiva:** Diseño sencillo y atractivo para facilitar la navegación y uso.
* **Soporte multi-formato:** Compatible con diversos tipos de archivos para cubrir todas las necesidades de documentación cultural.
* **Gestión sencilla:** Permite subir, visualizar y eliminar archivos de forma rápida.

## Tecnologías utilizadas

* **Frontend:** React, TypeScript, Tailwind CSS
* **Animaciones:** Framer Motion
* **Almacenamiento:** IndexedDB (idb)
* **Iconos:** Lucide React
* **Empaquetador:** Vite

## Estructura del proyecto


> Archivos_Culturales/
> ├── backend/           # Lógica del servidor (Express)
> ├── src/
> │   ├── assets/        # Recursos estáticos
> │   ├── components/    # Componentes de React
> │   ├── App.tsx        # Componente principal
> │   └── ...
> ├── index.html         # Punto de entrada HTML
> ├── package.json       # Dependencias y scripts
> └── ...


## Instalación y uso

### Requisitos previos

* Node.js (v14 o superior)
* npm o yarn

### Pasos para instalar

1.  Clonar el repositorio:

    ```bash
    git clone [https://github.com/Eduardo282/Archivos_Culturales.git](https://github.com/Eduardo282/Archivos_Culturales.git)
    cd Archivos_Culturales
    ```

2.  Instalar dependencias:

    ```bash
    npm install
    # o
    yarn install
    ```

3.  Iniciar el servidor de desarrollo:

    ```bash
    npm run dev
    # o
    yarn dev
    ```

4.  Abrir `http://localhost:5173` en el navegador.

## Scripts disponibles

* `npm run dev`: Inicia el servidor de desarrollo
* `npm run build`: Construye la aplicación para producción
* `npm run preview`: Vista previa de la versión de producción

## Contribuir

Si deseas contribuir a este proyecto, por favor:

1.  Haz un fork del repositorio.
2.  Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`).
3.  Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`).
4.  Haz push a la rama (`git push origin feature/nueva-caracteristica`).
5.  Abre un Pull Request.

## Contacto

Para más información o consultas, contactar a:

eduardofran@gestionesculturales.org

## Licencia

Este proyecto está destinado a fines culturales y educativos.

---

___Juntos preservamos la riqueza de nuestras culturas populares e indígenas.___

