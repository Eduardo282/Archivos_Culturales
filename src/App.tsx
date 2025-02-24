import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import FileGallery from "./components/FileGallery";
import { motion, AnimatePresence } from "framer-motion";
import { openDB } from "idb";

export interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

// Función para abrir la base de datos
async function initDB() {
  return openDB("FileDatabase", 1, {
    upgrade(db) {
      db.createObjectStore("files", { keyPath: "id" });
    },
  });
}

function App() {
  const [view, setView] = useState<"home" | "upload" | "gallery">("home");
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    // Cargar archivos desde IndexedDB al iniciar
    const loadFiles = async () => {
      const db = await initDB();
      const allFiles = await db.getAll("files");
      setFiles(allFiles);
    };

    loadFiles();
  }, []);

  // Función para añadir archivos a IndexedDB y al estado
  const addFiles = async (newFiles: FileItem[]) => {
    const db = await initDB();
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);

    for (const file of newFiles) {
      await db.put("files", file);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: "-100vw" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "100vw" },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="_7421c p-4">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="text-2xl patriaBold">Archivo Cultural</div>
          <div className="space-x-4 notoSansMedium">
            <motion.button
              onClick={() => setView("home")}
              className="hover:underline"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Inicio
            </motion.button>
            <motion.button
              onClick={() => setView("upload")}
              className="hover:underline"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Subir
            </motion.button>
            <motion.button
              onClick={() => setView("gallery")}
              className="hover:underline"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Galería
            </motion.button>
          </div>
        </nav>
      </header>

      <main className="flex-grow whiteBgGobierno">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center"
            >
              <h1 className="text-4xl mb-4 patriaBold">
                Bienvenido al Archivo Cultural
              </h1>
              <p className="text-xl mb-8 patriaRegular">
                Preservando y compartiendo nuestras culturas populares e
                indígenas
              </p>
              <div className="space-x-4 notoSansMedium">
                <motion.button
                  onClick={() => setView("gallery")}
                  className="bg-white text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explorar Galería
                </motion.button>
                <motion.button
                  onClick={() => setView("upload")}
                  className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subir Archivos
                </motion.button>
              </div>
            </motion.div>
          )}
          {view === "upload" && (
            <motion.div
              key="upload"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <FileUpload onFilesAdded={addFiles} />
            </motion.div>
          )}
          {view === "gallery" && (
            <motion.div
              key="gallery"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <FileGallery files={files} onDelete={async (id: string) => {
                const updatedFiles = files.filter(file => file.id !== id);
                setFiles(updatedFiles);
                const db = await initDB();
                await db.delete("files", id);
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="_7421c text-center py-4 notoSansMedium">
        <p className="patriaRegular">
          Juntos preservamos la riqueza de nuestras culturas populares e
          indígenas.
        </p>
        <p className="patriaRegular">
          Para más información sobre cómo contribuir, contacta a:
          eduardofran@gestionesculturales.org
        </p>
      </footer>
    </div>
  );
}

export default App;
