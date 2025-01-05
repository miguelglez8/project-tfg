package com.example.trabajosacademicos.jwt;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class JwtTokenFilterConfig {
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtTokenFilter() {
        FilterRegistrationBean<JwtAuthenticationFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new JwtAuthenticationFilter());
        registrationBean.addUrlPatterns("/api/users/**/delete");
        registrationBean.setUrlPatterns(Collections.singletonList("/api/notifications/**"));
        registrationBean.addUrlPatterns("/api/friendships/**");
        registrationBean.addUrlPatterns("/api/logout/**");
        registrationBean.addUrlPatterns("/api/tasks/**");
        registrationBean.addUrlPatterns("/api/taskStatus/**");
        registrationBean.addUrlPatterns("/api/events/**");
        registrationBean.addUrlPatterns("/api/calls/**");
        registrationBean.addUrlPatterns("/api/jobs/**");
        registrationBean.addUrlPatterns("/api/jobinquiries/**");
        registrationBean.addUrlPatterns("/api/stats/**");
        registrationBean.addUrlPatterns("/api/informs/**");
        return registrationBean;
    }
}
