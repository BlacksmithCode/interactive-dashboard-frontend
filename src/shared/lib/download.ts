/**
 * @file Утилита для скачивания файлов из Blob-ответа.
 */

/**
 * Скачивает файл по blob и имени.
 * @param blob - Blob или ArrayBuffer данных файла
 * @param filename - Имя файла для сохранения
 */
export function downloadFile(blob: Blob | ArrayBuffer, filename: string): void {
  const url = window.URL.createObjectURL(
    blob instanceof Blob ? blob : new Blob([blob])
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
