DROP TABLE IF EXISTS room;
CREATE TABLE Room (
                      id VARCHAR(36) PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      participant_limit INT CHECK (participant_limit > 0) NOT NULL,
                      is_active BOOLEAN NOT NULL
);


DROP TABLE IF EXISTS participant;
CREATE TABLE participant (
                             id VARCHAR(255) PRIMARY KEY,
                             name VARCHAR(255) NOT NULL,
                             room_id VARCHAR(255) NOT NULL,
                             joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             has_audio BOOLEAN NOT NULL DEFAULT true,
                             has_video BOOLEAN NOT NULL DEFAULT true
);
