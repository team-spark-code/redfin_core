package com.example.demo.service;

import com.example.demo.domain.Member;
import com.example.demo.dto.OAuthAttributes; // DTO import
import com.example.demo.repository.jpa.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 현재 로그인 진행 중인 서비스를 구분 (google, kakao, naver...)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        // OAuth2 로그인 진행 시 키가 되는 필드값 (Primary Key와 같은 의미)
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        // OAuth2User의 attribute를 담을 DTO
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        // 사용자 정보 저장 또는 업데이트
        Member member = saveOrUpdate(attributes);

        // Spring Security가 인증을 처리할 수 있도록 OAuth2User 객체를 반환
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    // 이메일로 사용자를 찾아, 없으면 새로 생성하고 있으면 정보를 업데이트하는 메소드
    private Member saveOrUpdate(OAuthAttributes attributes) {
        Member memberOptional = memberRepository.findByEmail(attributes.getEmail());

        Member member;
        if (memberOptional == null) {
            // 새로운 회원이면, DTO를 엔티티로 변환하여 저장
            // 소셜 로그인 사용자의 username은 email로 통일
            member = attributes.toEntity(attributes.getEmail());
        } else {
            // 이미 가입된 회원이면, 이름 정보만 업데이트
            member = memberOptional;
            member.setName(attributes.getName());
        }
        return memberRepository.save(member);
    }
}
