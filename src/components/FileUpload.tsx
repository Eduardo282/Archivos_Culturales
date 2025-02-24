import React, { useCallback, useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { FileItem } from "../App";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { openDB } from "idb";

interface FileUploadProps {
  onFilesAdded: (files: FileItem[]) => void;
}

function FileUpload({ onFilesAdded }: FileUploadProps) {
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const loadFilesFromDB = async () => {
      const db = await openDB("fileUploadDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("files")) {
            db.createObjectStore("files", { keyPath: "name" });
          }
        },
      });
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const allFileData = await store.getAll();
      const files = allFileData.map((fileData) => {
        const blob = new Blob([fileData.data], { type: fileData.type });
        return new File([blob], fileData.name, {
          type: fileData.type,
          lastModified: fileData.lastModified,
        });
      });
      setPreviewFiles(files);
    };
    loadFilesFromDB();
  }, []);

  const saveFilesToDB = async (files: File[]) => {
    const db = await openDB("fileUploadDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "name" });
        }
      },
    });
    const savePromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      await store.put({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: arrayBuffer,
      });
      await tx.done;
    });

    await Promise.all(savePromises);
  };

  const processFiles = useCallback((files: File[]) => {
    setPreviewFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...files];
      saveFilesToDB(newFiles);
      return newFiles;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      processFiles(Array.from(e.dataTransfer.files));
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files));
      }
    },
    [processFiles]
  );

  const handleUpload = async () => {
    // Set progress to 0 when starting the upload
    setUploadProgress(0);
    const formData = new FormData();
    previewFiles.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const response = await axios.post<{ files: FileItem[] }>(
        "https://archivos.gestionesculturales.org/upload/index.php",
        formData,
        config
      );

      onFilesAdded(response.data.files);
      setPreviewFiles([]);
      setUploadProgress(null);
      const db = await openDB("fileUploadDB", 1);
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      await store.clear();
      await tx.done;
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please check your connection.");
      setUploadProgress(null);
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = previewFiles[index];
    setPreviewFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    const db = await openDB("fileUploadDB", 1);
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    await store.delete(fileToRemove.name);
    await tx.done;
  };

  const renderPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else if (file.type.startsWith("video/")) {
      return <video src={url} controls className="w-full h-full object" />;
    } else if (file.type.startsWith("audio/")) {
      return (
        <audio
          src={url}
          controls
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center rounded-lg notoSansMedium">
          {file.name}
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.h2
        className="text-3xl font-bold text-white mb-8 text-center patriaBold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Subir Archivos Culturales
      </motion.h2>
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 text-blue-600 text-sm notoSansRegular">
          <p className="text-black">
            Tu contribución es valiosa. Sube imágenes, videos, audios o
            documentos que representen la riqueza de nuestras culturas populares
            e indígenas. Juntos, preservamos nuestra herencia.
          </p>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 notoSansRegular">
              Arrastra y suelta tus archivos culturales aquí, o haz clic para
              seleccionarlos
            </p>
            <p className="mt-1 text-xs text-gray-500 notoSansLightItalic">
              Comparte imágenes de artesanías, videos de danzas tradicionales,
              grabaciones de música folclórica, o documentos sobre costumbres y
              tradiciones
            </p>
          </label>
        </div>
        <AnimatePresence>
          {previewFiles.length > 0 && (
            <motion.div
              className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {previewFiles.map((file, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderPreview(file)}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-700 text-white rounded-full p-1 hover:bg-red-900 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {uploadProgress !== null && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs inline-block py-1 px-2 uppercase rounded-full bg-gray-400 notoSansMedium">
                    Subiendo...
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block notoSansMedium">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-400">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-800"
                ></div>
              </div>
            </div>
          </div>
        )}
        <motion.button
          onClick={handleUpload}
          disabled={previewFiles.length === 0 || uploadProgress !== null}
          className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors notoSansMedium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {uploadProgress !== null ? `${uploadProgress}%` : "Compartir con la comunidad"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default FileUpload;
