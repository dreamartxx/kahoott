-- Hostinger Business Plan MySQL / MariaDB Database Schema
-- Site: https://grey-cassowary-525647.hostingersite.com/
-- Import via Hostinger hPanel -> Databases -> phpMyAdmin

CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) DEFAULT 'Genel Kültür',
  `cover_emoji` VARCHAR(32) DEFAULT '🎮',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `questions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `quiz_id` VARCHAR(64) NOT NULL,
  `question_text` TEXT NOT NULL,
  `time_limit` INT DEFAULT 20,
  `points` INT DEFAULT 1000,
  `category` VARCHAR(100),
  `explanation` TEXT,
  `options_json` LONGTEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  INDEX (`quiz_id`),
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `game_sessions` (
  `pin` VARCHAR(16) PRIMARY KEY,
  `quiz_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `host_name` VARCHAR(100) DEFAULT 'Host',
  `player_count` INT DEFAULT 0,
  `status` VARCHAR(32) DEFAULT 'COMPLETED',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leaderboard_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_pin` VARCHAR(16),
  `quiz_id` VARCHAR(64),
  `player_nickname` VARCHAR(100) NOT NULL,
  `avatar` VARCHAR(32) DEFAULT '🦊',
  `final_score` INT DEFAULT 0,
  `final_rank` INT DEFAULT 1,
  `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`quiz_id`),
  INDEX (`player_nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
