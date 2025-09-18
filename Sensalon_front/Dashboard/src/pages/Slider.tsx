import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { uploadSliderImage } from "../services/slider/insertSliderImage";
import { getSliderImages } from "../services/slider/getSliderImage";
import { deleteSliderImages } from "../services/slider/deleteSliderImage";
import { SuccessToast } from "../components/Toast/successToast";
import { ErrorToast } from "../components/Toast/errorToast";
interface ImageData {
  id: string;
  file: File;
  url: string;
}
interface ImageSliderProps {
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  maxImages?: number;
  "data-id"?: string;
}

export const Slider: React.FC<ImageSliderProps> = () => {
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 25;
  const acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxImages = 10;

  const fetchImages = async () => {
    try {
      const data = await getSliderImages();
      const loadedImages: ImageData[] = data.map((img: any) => ({
        id: img.iIdSliderImage,
        url: img.vcurl_img,
      }));
      setImages(loadedImages);
      setCurrentIndex(0);
    } catch (err) {
      setError("Error al cargar imágenes desde el servidor.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return "Tipo de archivo no válido. Solo se permiten imágenes.";
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxFileSize}MB.`;
    }
    return null;
  };
  const handleFiles = (files: FileList) => {
    setError("");
    const fileArray = Array.from(files);
    if (filesToUpload.length + fileArray.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas.`);
      return;
    }

    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFilesToUpload((prev) => [...prev, ...validFiles]);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };
  const removeImage = async (id: string) => {
    try {
      const result = await deleteSliderImages(id);
      console.log(result);
      setShowToast(true);
      setToastMessage(result.message);
      setToastType("success");
      fetchImages();
      setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
        setShowToast(false);
      }, 3000);
    } catch (err: any) {
      console.error("❌", err.message);
      setError(err.message);
    }
  };

  const removeFileToUpload = (index: number) => {
    const newFiles = [...filesToUpload];
    newFiles.splice(index, 1);
    setFilesToUpload(newFiles);
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      setError("No hay imágenes para subir.");
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("images", file); // "images" debe coincidir con .array('images', 10)
    });

    try {
      const result = await uploadSliderImage(formData);
      console.log("✅ Subida exitosa:", result);
      setToastMessage(result.message);
      setToastType("success");
      setShowToast(true);
      // Limpia la vista previa si quieres
      setImages(result);
      setCurrentIndex(0);
      setFilesToUpload([]);
      fetchImages();
      setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
        setShowToast(false);
      }, 3000);
    } catch (err: any) {
      console.error("❌", err.message);
      setError(err.message);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  console.log(toastMessage);
  return (
    <>
      <div className="fixed top-0 right-0 z-50 p-4">
        {toastMessage && toastType === "success" && (
          <SuccessToast message={toastMessage} showToast={showToast} />
        )}
        {toastMessage && toastType === "error" && (
          <ErrorToast message={toastMessage} showToast={showToast} />
        )}
      </div>

      <div className="py-12 px-3">
        <h1 className="text-3xl font-bold text-[#1d1d1b]">
          Administrar slider
        </h1>

        <div
          className="mx-auto p-4 mt-3 bg-white rounded-lg shadow-lg"
          data-id="data-id"
        >
          {/* Upload Area */}
          <div className="mb-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arrastra y suelta tus imágenes aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">
                o haz clic para seleccionar archivos
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Seleccionar Imágenes
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(",")}
                onChange={handleFileInput}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-2">
                Máximo {maxFileSize}MB por imagen • {maxImages} imágenes máximo
              </p>

              <ul className="text-sm text-gray-600 space-y-2 mt-2">
                {filesToUpload.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 rounded px-3 py-1"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeFileToUpload(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleUpload}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 "
                  disabled={filesToUpload.length === 0}
                >
                  Subir al servidor
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
          {/* Slider */}
          {images.length > 0 ? (
            <div>
              {/* Main Image Display */}
              <div className="relative w-full max-w-4xl mx-auto aspect-[40/13] bg-gray-100 rounded-lg overflow-hidden sm:max-w-full">
                <img
                  src={`${images[currentIndex].url}`}
                  alt={`Imagen ${currentIndex + 1}`}
                  className="w-full h-full max-h-full mx-auto object-contain"
                />
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                {/* Delete Button */}
                <button
                  onClick={() => removeImage(images[currentIndex].id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <img
                        src={image.url}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                No hay imágenes para mostrar
              </p>
              <p className="text-gray-400 text-sm">
                Sube algunas imágenes para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
