package com.example.demo.repository.elasticsearch;

import com.example.demo.domain.Member;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test") // 테스트 환경이 아닐 때만 활성화
public interface MemberElasticsearchRepository extends ElasticsearchRepository<Member, Long> {

    // 개선된 정확도 기반 검색 - keyword 필드와 exact match 우선
    @Query("{\"bool\": {\"should\": [" +
           "{\"term\": {\"name.keyword\": {\"value\": \"?0\", \"boost\": 10.0}}}," +
           "{\"term\": {\"username.keyword\": {\"value\": \"?0\", \"boost\": 9.0}}}," +
           "{\"term\": {\"email.keyword\": {\"value\": \"?0\", \"boost\": 8.0}}}," +
           "{\"match_phrase\": {\"name\": {\"query\": \"?0\", \"boost\": 7.0}}}," +
           "{\"match_phrase\": {\"username\": {\"query\": \"?0\", \"boost\": 6.0}}}," +
           "{\"match_phrase\": {\"email\": {\"query\": \"?0\", \"boost\": 5.0}}}," +
           "{\"match_phrase\": {\"address\": {\"query\": \"?0\", \"boost\": 4.0}}}," +
           "{\"prefix\": {\"name.keyword\": {\"value\": \"?0\", \"boost\": 3.0}}}," +
           "{\"prefix\": {\"username.keyword\": {\"value\": \"?0\", \"boost\": 2.5}}}," +
           "{\"wildcard\": {\"name.keyword\": {\"value\": \"*?0*\", \"boost\": 2.0}}}," +
           "{\"wildcard\": {\"username.keyword\": {\"value\": \"*?0*\", \"boost\": 1.5}}}" +
           "], \"minimum_should_match\": 1}}")
    Page<Member> findByKeywordWithHighRelevance(String keyword, Pageable pageable);

    // 정확한 매칭 우선 검색 - 완전 일치와 부분 일치
    @Query("{\"bool\": {\"should\": [" +
           "{\"term\": {\"name.keyword\": {\"value\": \"?0\", \"boost\": 15.0}}}," +
           "{\"term\": {\"username.keyword\": {\"value\": \"?0\", \"boost\": 12.0}}}," +
           "{\"term\": {\"email.keyword\": {\"value\": \"?0\", \"boost\": 10.0}}}," +
           "{\"match_phrase\": {\"name\": {\"query\": \"?0\", \"boost\": 8.0}}}," +
           "{\"match_phrase\": {\"username\": {\"query\": \"?0\", \"boost\": 7.0}}}," +
           "{\"match_phrase\": {\"address\": {\"query\": \"?0\", \"boost\": 5.0}}}" +
           "], \"minimum_should_match\": 1}}")
    Page<Member> findByExactMatchWithHighRelevance(String keyword, Pageable pageable);

    // 부분 매칭 및 유사도 검색
    @Query("{\"bool\": {\"should\": [" +
           "{\"wildcard\": {\"name.keyword\": {\"value\": \"*?0*\", \"boost\": 5.0}}}," +
           "{\"wildcard\": {\"username.keyword\": {\"value\": \"*?0*\", \"boost\": 4.0}}}," +
           "{\"wildcard\": {\"email.keyword\": {\"value\": \"*?0*\", \"boost\": 3.0}}}," +
           "{\"match\": {\"name\": {\"query\": \"?0\", \"fuzziness\": \"AUTO\", \"boost\": 2.5}}}," +
           "{\"match\": {\"username\": {\"query\": \"?0\", \"fuzziness\": \"AUTO\", \"boost\": 2.0}}}," +
           "{\"match\": {\"address\": {\"query\": \"?0\", \"fuzziness\": \"AUTO\", \"boost\": 1.5}}}" +
           "], \"minimum_should_match\": 1}}")
    Page<Member> findByFuzzySearchWithHighRelevance(String keyword, Pageable pageable);

    // N-gram 기반 부분 문자열 검색
    @Query("{\"bool\": {\"should\": [" +
           "{\"match\": {\"name.ngram\": {\"query\": \"?0\", \"boost\": 3.0}}}," +
           "{\"match\": {\"username.ngram\": {\"query\": \"?0\", \"boost\": 2.5}}}," +
           "{\"match\": {\"address.ngram\": {\"query\": \"?0\", \"boost\": 2.0}}}" +
           "], \"minimum_should_match\": 1}}")
    Page<Member> findByNgramSearch(String keyword, Pageable pageable);

    // 전화번호 검색
    @Query("{\"bool\": {\"should\": [" +
           "{\"term\": {\"phoneNumber\": {\"value\": \"?0\", \"boost\": 5.0}}}," +
           "{\"wildcard\": {\"phoneNumber\": {\"value\": \"*?0*\", \"boost\": 3.0}}}" +
           "], \"minimum_should_match\": 1}}")
    Page<Member> findByPhoneNumber(String phoneNumber, Pageable pageable);

    // 기본 포함 검색 - fallback용
    Page<Member> findByUsernameContaining(String username, Pageable pageable);
    Page<Member> findByNameContaining(String name, Pageable pageable);
    Page<Member> findByEmailContaining(String email, Pageable pageable);
    Page<Member> findByAddressContaining(String address, Pageable pageable);
}
