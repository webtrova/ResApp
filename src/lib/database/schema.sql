-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  template_id INT DEFAULT 1,
  resume_data JSON NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Language transformations (for learning and improvement)
CREATE TABLE transformations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  original_text TEXT NOT NULL,
  transformed_text TEXT NOT NULL,
  industry VARCHAR(100),
  role_level ENUM('entry', 'mid', 'senior'),
  feedback_rating INT CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Resume uploads and optimizations
CREATE TABLE resume_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'docx', 'doc', 'txt') NOT NULL,
  extracted_text LONGTEXT,
  parsed_data JSON NOT NULL,
  optimization_results JSON,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Templates table
CREATE TABLE templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates
INSERT INTO templates (name, description, template_data) VALUES
('Classic Professional', 'Traditional format with clean typography', '{"name": "classic", "style": "traditional"}'),
('Modern Clean', 'Contemporary design with subtle styling', '{"name": "modern", "style": "contemporary"}'),
('ATS-Optimized', 'Maximum compatibility with applicant tracking systems', '{"name": "ats", "style": "minimal"}');
