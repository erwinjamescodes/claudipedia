-- Function to increment questions answered in study_sessions
CREATE OR REPLACE FUNCTION increment_questions_answered(session_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE study_sessions 
  SET questions_answered = questions_answered + 1
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_statistics(session_id INTEGER)
RETURNS TABLE(
  total_questions INTEGER,
  questions_answered INTEGER,
  correct_answers INTEGER,
  accuracy_percentage DECIMAL(5,2),
  average_time_seconds DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.total_questions_available,
    ss.questions_answered,
    COALESCE(COUNT(CASE WHEN up.is_correct = true THEN 1 END)::INTEGER, 0) as correct_answers,
    CASE 
      WHEN ss.questions_answered > 0 THEN 
        ROUND((COUNT(CASE WHEN up.is_correct = true THEN 1 END)::DECIMAL / ss.questions_answered) * 100, 2)
      ELSE 0 
    END as accuracy_percentage,
    COALESCE(AVG(up.time_spent), 0) as average_time_seconds
  FROM study_sessions ss
  LEFT JOIN user_progress up ON ss.id = up.session_id
  WHERE ss.id = get_session_statistics.session_id
  GROUP BY ss.id, ss.total_questions_available, ss.questions_answered;
END;
$$ LANGUAGE plpgsql;