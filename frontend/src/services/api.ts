// TODO: Реализовать функцию uploadImage с отслеживанием прогресса
// 
// Функция должна:
// 1. Принимать файл и callback для обновления прогресса
// 2. Формировать FormData для отправки
// 3. Использовать XMLHttpRequest для отслеживания прогресса загрузки
// 4. Обрабатывать события прогресса (onprogress) и вызывать callback
// 5. Обрабатывать успешный ответ от сервера
// 6. Обрабатывать ошибки сети и сервера
// 7. Возвращать Promise с объектом { url: string }
//
// Пример использования:
// uploadImage(file, (progress) => {
//   console.log(`Загружено: ${progress}%`);
// })
// .then(({ url }) => {
//   console.log('Изображение загружено:', url);
// })
// .catch((error) => {
//   console.error('Ошибка загрузки:', error);
// });

export interface UploadResponse {
  url: string;
}

export type ProgressCallback = (progress: number) => void;

export function uploadImage(
  file: File,
  onProgress: ProgressCallback
): Promise<UploadResponse> {
  // TODO: Реализовать эту функцию
  throw new Error('Функция uploadImage не реализована. См. комментарий выше.');
}

