-- Create study_sessions table
  CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Study Session',
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('random', 'by_chapter', 'mixed', 'review', 'mock_exam')),
    selected_chapters TEXT[],
    is_active BOOLEAN DEFAULT true,
    total_questions_available INTEGER NOT NULL,
    questions_answered INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Create user_progress table
  CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    is_flagged BOOLEAN DEFAULT false,
    time_spent INTEGER,
    answered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, question_id)
  );

  -- Create session_question_pool table
  CREATE TABLE session_question_pool (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    is_answered BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, question_id)
  );

  -- Create mock_exam_settings table
  CREATE TABLE mock_exam_settings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
    time_limit_minutes INTEGER NOT NULL DEFAULT 120,
    question_count INTEGER NOT NULL DEFAULT 50,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_choices BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Create user_statistics table (optional - for analytics)
  CREATE TABLE user_statistics (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
    chapter VARCHAR(255),
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    average_time_seconds DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, chapter)
  );

  -- Create indexes for performance optimization
  CREATE INDEX idx_study_sessions_active ON study_sessions(is_active);
  CREATE INDEX idx_user_progress_session ON user_progress(session_id);
  CREATE INDEX idx_user_progress_question ON user_progress(question_id);
  CREATE INDEX idx_session_question_pool_session ON session_question_pool(session_id);
  CREATE INDEX idx_session_question_pool_answered ON session_question_pool(is_answered);
  CREATE INDEX idx_user_statistics_session_chapter ON user_statistics(session_id, chapter);
  CREATE INDEX idx_questions_chapter ON questions(chapter);

  -- Add trigger to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_study_sessions_updated_at
      BEFORE UPDATE ON study_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();