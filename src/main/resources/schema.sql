DROP TABLE IF EXISTS room;
CREATE TABLE Room (
                      id VARCHAR(36) PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      participant_limit INT CHECK (participant_limit > 0) NOT NULL,
                      is_active BOOLEAN NOT NULL
);
