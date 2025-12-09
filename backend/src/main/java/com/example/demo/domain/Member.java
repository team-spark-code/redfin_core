package com.example.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.EntityListeners;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.MultiField;
import org.springframework.data.elasticsearch.annotations.InnerField;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "member")
//  엘라스틱서치에서 사용하는 어노테이션
@Document(indexName = "members")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "standard"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword),
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer")
        }
    )
    private String username; // 아이디(로그인용)

    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "standard"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword),
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer")
        }
    )
    private String name;     // 이름(실명)

    private String password;

    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "standard"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword)
        }
    )
    private String email;

    @Column(name = "phone")
    @Field(type = FieldType.Keyword)
    private String phoneNumber;

    @Column(name = "zipcode")
    @Field(type = FieldType.Keyword)
    private String zipcode;

    @Column(name = "address")
    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "standard"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword),
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer")
        }
    )
    private String address;

    @Column(name = "detail_address")
    @Field(type = FieldType.Text, analyzer = "standard")
    private String detailAddress;

    // 관심사를 JSON 형태로 저장
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interests", columnDefinition = "JSON")
    @Field(type = FieldType.Keyword)
    private List<String> interests;

    @jakarta.persistence.Transient
    private String passwordConfirm;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
