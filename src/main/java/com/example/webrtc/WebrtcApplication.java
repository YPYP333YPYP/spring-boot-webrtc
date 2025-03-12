package com.example.webrtc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jdbc.repository.config.EnableJdbcAuditing;

@SpringBootApplication
@EnableJdbcAuditing
public class WebrtcApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebrtcApplication.class, args);
	}

}
