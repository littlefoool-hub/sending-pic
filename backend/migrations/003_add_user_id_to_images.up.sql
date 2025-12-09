-- Добавляем поле user_id в таблицу images
ALTER TABLE images ADD COLUMN user_id TEXT NOT NULL DEFAULT '';

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_id ON images(user_id);

-- Внешний ключ (если нужно, можно включить после заполнения данных)
-- ALTER TABLE images ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);

