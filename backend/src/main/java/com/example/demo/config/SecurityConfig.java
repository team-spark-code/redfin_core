package com.example.demo.config;

import com.example.demo.domain.Member;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.security.JsonUsernamePasswordAuthenticationFilter;
import com.example.demo.service.CustomOAuth2UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, CustomOAuth2UserService customOAuth2UserService) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable) // 폼 로그인 방식 비활성화
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/signup", "/api/check-email", "/api/check-username", "/api/login").permitAll()
                .requestMatchers("/api/job-interest", "/api/ai-company", "/api/ai-field").permitAll()
                .requestMatchers("/", "/signup", "/login", "/static/**", "/js/**", "/css/**").permitAll()
                .requestMatchers("/members/**", "/profile").hasRole("USER")
                .anyRequest().authenticated()
            );

        // JSON 로그인 필터 추가
        JsonUsernamePasswordAuthenticationFilter jsonUsernamePasswordAuthenticationFilter = new JsonUsernamePasswordAuthenticationFilter(authenticationManager());
        jsonUsernamePasswordAuthenticationFilter.setAuthenticationSuccessHandler((request, response, authentication) -> {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Member member = userDetails.getMember();

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", member.getId());
            userInfo.put("email", member.getEmail());
            userInfo.put("name", member.getName());

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "로그인 성공");
            result.put("user", userInfo);

            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new ObjectMapper().writeValueAsString(result));
        });
        jsonUsernamePasswordAuthenticationFilter.setAuthenticationFailureHandler((request, response, exception) -> {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
            response.getWriter().write(new ObjectMapper().writeValueAsString(result));
        });

        http.addFilterAt(jsonUsernamePasswordAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        http
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
            );

        return http.build();
    }
}
