-- Migration Helper Functions for Pillar Response Values
-- These functions handle conversion between JSONB and normalized storage formats

-- Function to migrate a single response from JSONB to normalized format
CREATE OR REPLACE FUNCTION migrate_response_to_normalized(
  p_response_id UUID,
  p_jsonb_responses JSONB
) RETURNS TABLE(
  success_count INTEGER,
  error_count INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  question_record RECORD;
  jsonb_value JSONB;
  text_value TEXT;
  numeric_value NUMERIC;
  boolean_value BOOLEAN;
  array_value TEXT[];
  response_pillar TEXT;
  success_counter INTEGER := 0;
  error_counter INTEGER := 0;
  error_messages TEXT[] := '{}';
  current_error TEXT;
BEGIN
  -- Get the pillar for this response
  SELECT pillar INTO response_pillar 
  FROM pillar_responses 
  WHERE id = p_response_id;
  
  IF response_pillar IS NULL THEN
    RAISE EXCEPTION 'Response with ID % not found', p_response_id;
  END IF;
  
  -- Process each question for this pillar
  FOR question_record IN 
    SELECT question_id, question_type 
    FROM pillar_questions 
    WHERE pillar = response_pillar
    ORDER BY order_index
  LOOP
    BEGIN
      -- Extract value from JSONB
      jsonb_value := p_jsonb_responses -> question_record.question_id;
      
      -- Skip if no value exists for this question
      IF jsonb_value IS NULL OR jsonb_value = 'null'::jsonb THEN
        CONTINUE;
      END IF;
      
      -- Convert and insert based on question type
      CASE question_record.question_type
        WHEN 'text', 'textarea', 'select' THEN
          text_value := jsonb_value #>> '{}';
          
          -- Skip empty strings
          IF text_value IS NULL OR trim(text_value) = '' THEN
            CONTINUE;
          END IF;
          
          INSERT INTO pillar_response_values (
            response_id, question_id, question_type, value_text
          ) VALUES (
            p_response_id, question_record.question_id, question_record.question_type, text_value
          )
          ON CONFLICT (response_id, question_id) DO UPDATE SET 
            value_text = EXCLUDED.value_text,
            question_type = EXCLUDED.question_type,
            updated_at = NOW();
          
        WHEN 'number' THEN
          -- Handle both string and numeric representations with special cases
          IF jsonb_typeof(jsonb_value) = 'string' THEN
            text_value := jsonb_value #>> '{}';
            
            -- Handle special safety incident cases and other string-to-number conversions
            CASE LOWER(TRIM(text_value))
              WHEN '0' THEN numeric_value := 0;
              WHEN '1' THEN numeric_value := 1;
              WHEN '2 or more' THEN numeric_value := 2;
              WHEN 'yes' THEN numeric_value := 1;
              WHEN 'no' THEN numeric_value := 0;
              ELSE 
                -- Try to parse as a regular number
                IF text_value ~ '^-?\d+\.?\d*$' THEN
                  numeric_value := text_value::NUMERIC;
                ELSE
                  -- Default to 0 for unparseable strings, but log it
                  numeric_value := 0;
                  RAISE WARNING 'Unparseable numeric value "%" for question % in response %, defaulting to 0', 
                    text_value, question_record.question_id, p_response_id;
                END IF;
            END CASE;
          ELSE
            -- Direct numeric value
            numeric_value := (jsonb_value #>> '{}')::NUMERIC;
          END IF;
          
          INSERT INTO pillar_response_values (
            response_id, question_id, question_type, value_number
          ) VALUES (
            p_response_id, question_record.question_id, question_record.question_type, numeric_value
          )
          ON CONFLICT (response_id, question_id) DO UPDATE SET 
            value_number = EXCLUDED.value_number,
            question_type = EXCLUDED.question_type,
            updated_at = NOW();
          
        WHEN 'boolean' THEN
          -- Handle boolean values with string representations
          IF jsonb_typeof(jsonb_value) = 'string' THEN
            text_value := LOWER(TRIM(jsonb_value #>> '{}'));
            CASE text_value
              WHEN 'true', 'yes', '1', 'on' THEN boolean_value := TRUE;
              WHEN 'false', 'no', '0', 'off' THEN boolean_value := FALSE;
              ELSE boolean_value := FALSE; -- Default to false for ambiguous values
            END CASE;
          ELSE
            boolean_value := (jsonb_value #>> '{}')::BOOLEAN;
          END IF;
          
          INSERT INTO pillar_response_values (
            response_id, question_id, question_type, value_boolean
          ) VALUES (
            p_response_id, question_record.question_id, question_record.question_type, boolean_value
          )
          ON CONFLICT (response_id, question_id) DO UPDATE SET 
            value_boolean = EXCLUDED.value_boolean,
            question_type = EXCLUDED.question_type,
            updated_at = NOW();
          
        WHEN 'multiselect' THEN
          -- Handle array values with various input formats
          IF jsonb_typeof(jsonb_value) = 'array' THEN
            -- Proper array format
            SELECT ARRAY(
              SELECT jsonb_array_elements_text(jsonb_value) 
              WHERE jsonb_array_elements_text(jsonb_value) IS NOT NULL 
                AND TRIM(jsonb_array_elements_text(jsonb_value)) != ''
            ) INTO array_value;
          ELSIF jsonb_typeof(jsonb_value) = 'string' THEN
            -- Single string value, convert to array
            text_value := jsonb_value #>> '{}';
            IF text_value IS NOT NULL AND TRIM(text_value) != '' THEN
              array_value := ARRAY[text_value];
            ELSE
              array_value := '{}'; -- Empty array
            END IF;
          ELSE
            -- Fallback for other types
            array_value := ARRAY[jsonb_value #>> '{}'];
          END IF;
          
          -- Only insert if array has content
          IF array_length(array_value, 1) > 0 THEN
            INSERT INTO pillar_response_values (
              response_id, question_id, question_type, value_array
            ) VALUES (
              p_response_id, question_record.question_id, question_record.question_type, array_value
            )
            ON CONFLICT (response_id, question_id) DO UPDATE SET 
              value_array = EXCLUDED.value_array,
              question_type = EXCLUDED.question_type,
              updated_at = NOW();
          END IF;
          
      END CASE;
      
      success_counter := success_counter + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_counter := error_counter + 1;
      current_error := format('Question %s: %s', question_record.question_id, SQLERRM);
      error_messages := array_append(error_messages, current_error);
      
      -- Log the error but continue processing other questions
      RAISE WARNING 'Failed to migrate question % for response %: %', 
        question_record.question_id, p_response_id, SQLERRM;
    END;
  END LOOP;
  
  -- Return summary
  RETURN QUERY SELECT success_counter, error_counter, error_messages;
END;
$$ LANGUAGE plpgsql;

-- Function to reconstruct JSONB from normalized values (for backward compatibility)
CREATE OR REPLACE FUNCTION sync_normalized_to_jsonb(p_response_id UUID) 
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  value_record RECORD;
BEGIN
  -- Build JSONB object from normalized values
  FOR value_record IN 
    SELECT question_id, question_type, value_text, value_number, value_boolean, value_array
    FROM pillar_response_values 
    WHERE response_id = p_response_id
    ORDER BY question_id
  LOOP
    CASE value_record.question_type
      WHEN 'text', 'textarea', 'select' THEN
        result := result || jsonb_build_object(value_record.question_id, value_record.value_text);
      WHEN 'number' THEN
        result := result || jsonb_build_object(value_record.question_id, value_record.value_number);
      WHEN 'boolean' THEN
        result := result || jsonb_build_object(value_record.question_id, value_record.value_boolean);
      WHEN 'multiselect' THEN
        result := result || jsonb_build_object(value_record.question_id, to_jsonb(value_record.value_array));
    END CASE;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate migration integrity
CREATE OR REPLACE FUNCTION validate_response_migration(p_response_id UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  original_keys TEXT[],
  migrated_keys TEXT[],
  missing_keys TEXT[],
  extra_keys TEXT[],
  validation_errors TEXT[]
) AS $$
DECLARE
  original_responses JSONB;
  reconstructed_responses JSONB;
  orig_keys TEXT[];
  migr_keys TEXT[];
  missing TEXT[] := '{}';
  extra TEXT[] := '{}';
  errors TEXT[] := '{}';
  key_name TEXT;
  is_migration_valid BOOLEAN := TRUE;
BEGIN
  -- Get original JSONB responses
  SELECT responses INTO original_responses 
  FROM pillar_responses 
  WHERE id = p_response_id;
  
  IF original_responses IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT[], NULL::TEXT[], NULL::TEXT[], NULL::TEXT[], 
                         ARRAY['Response not found']::TEXT[];
    RETURN;
  END IF;
  
  -- Get reconstructed JSONB from normalized data
  SELECT sync_normalized_to_jsonb(p_response_id) INTO reconstructed_responses;
  
  -- Extract keys from both objects
  SELECT ARRAY(SELECT jsonb_object_keys(original_responses)) INTO orig_keys;
  SELECT ARRAY(SELECT jsonb_object_keys(reconstructed_responses)) INTO migr_keys;
  
  -- Find missing keys (in original but not in migrated)
  FOREACH key_name IN ARRAY orig_keys
  LOOP
    IF NOT (key_name = ANY(migr_keys)) THEN
      missing := array_append(missing, key_name);
      is_migration_valid := FALSE;
    END IF;
  END LOOP;
  
  -- Find extra keys (in migrated but not in original)
  FOREACH key_name IN ARRAY migr_keys
  LOOP
    IF NOT (key_name = ANY(orig_keys)) THEN
      extra := array_append(extra, key_name);
      is_migration_valid := FALSE;
    END IF;
  END LOOP;
  
  -- Validate content for matching keys
  FOREACH key_name IN ARRAY orig_keys
  LOOP
    IF key_name = ANY(migr_keys) THEN
      -- Compare values (with type tolerance)
      IF NOT (
        (original_responses -> key_name) = (reconstructed_responses -> key_name) OR
        (original_responses ->> key_name) = (reconstructed_responses ->> key_name)
      ) THEN
        errors := array_append(errors, 
          format('Value mismatch for key %s: original=%s, migrated=%s', 
            key_name, 
            original_responses ->> key_name, 
            reconstructed_responses ->> key_name));
        is_migration_valid := FALSE;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT is_migration_valid, orig_keys, migr_keys, missing, extra, errors;
END;
$$ LANGUAGE plpgsql;

-- Function to get migration statistics
CREATE OR REPLACE FUNCTION get_migration_stats()
RETURNS TABLE(
  total_responses BIGINT,
  migrated_responses BIGINT,
  migration_percentage NUMERIC,
  total_values BIGINT,
  values_by_type JSONB,
  latest_migration TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM pillar_responses) as total_responses,
    (SELECT COUNT(DISTINCT response_id) FROM pillar_response_values) as migrated_responses,
    ROUND(
      (SELECT COUNT(DISTINCT response_id) FROM pillar_response_values) * 100.0 / 
      NULLIF((SELECT COUNT(*) FROM pillar_responses), 0), 
      2
    ) as migration_percentage,
    (SELECT COUNT(*) FROM pillar_response_values) as total_values,
    (SELECT jsonb_object_agg(question_type, type_count) 
     FROM (
       SELECT question_type, COUNT(*) as type_count 
       FROM pillar_response_values 
       GROUP BY question_type
     ) grouped) as values_by_type,
    (SELECT MAX(created_at) FROM pillar_response_values) as latest_migration;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON FUNCTION migrate_response_to_normalized IS 'Migrates a single response from JSONB to normalized format with error handling';
COMMENT ON FUNCTION sync_normalized_to_jsonb IS 'Reconstructs JSONB format from normalized values for backward compatibility';
COMMENT ON FUNCTION validate_response_migration IS 'Validates that migration preserved all data correctly';
COMMENT ON FUNCTION get_migration_stats IS 'Returns statistics about migration progress and data distribution';