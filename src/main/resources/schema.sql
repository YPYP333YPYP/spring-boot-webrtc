CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS room;
CREATE TABLE Room (
                      id VARCHAR(36) DEFAULT uuid_generate_v4()::VARCHAR PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      participant_limit INT CHECK (participant_limit > 0) NOT NULL,
                      is_active BOOLEAN NOT NULL
);


DROP TABLE IF EXISTS participant;
CREATE TABLE participant (
                             id VARCHAR(36) DEFAULT uuid_generate_v4()::VARCHAR PRIMARY KEY,
                             name VARCHAR(255) NOT NULL,
                             room_id VARCHAR(255) NOT NULL,
                             joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             has_audio BOOLEAN NOT NULL DEFAULT true,
                             has_video BOOLEAN NOT NULL DEFAULT true
);

DROP TABLE IF EXISTS chat_message;
CREATE TABLE chat_message (
                              id SERIAL PRIMARY KEY,
                              sender VARCHAR(255) NOT NULL,
                              content TEXT NOT NULL,
                              room_id VARCHAR(255) NOT NULL,
                              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
