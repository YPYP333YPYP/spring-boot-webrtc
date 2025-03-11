package com.example.webrtc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // Spring MVC 설정 클래스
public class WebConfig implements WebMvcConfigurer {

    /**
     * 정적 리소스 처리 메서드
     * /static/** 경로에 있는 요청에 대한 처리 방법 정의
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/");
    }


    /**
     * View와 URL 매핑
     * / 경로에 대한 index View 매핑
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }
}