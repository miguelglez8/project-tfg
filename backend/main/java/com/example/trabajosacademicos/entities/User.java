package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Enumerated(EnumType.STRING)
    private Connectivity currentConnectivity;
    @Enumerated(EnumType.STRING)
    private Connectivity lastConnectivity;
    @NotBlank(message = "The 'firstName' field cannot be blank")
    @Length(max = 255, message = "The 'firstName' field cannot have more than 255 characters")
    private String firstName;
    @NotBlank(message = "The 'lastName' field cannot be blank")
    @Length(max = 255, message = "The 'lastName' field cannot have more than 255 characters")
    private String lastName;
    @Column(unique = true, nullable = false)
    @NotBlank(message = "The 'email' field cannot be empty")
    @Email(message = "The 'email' field must be a valid email address")
    private String email;
    @Length(max = 255, message = "The 'place' field cannot have more than 255 characters")
    private String place;
    @Past(message = "The 'birthdate' field must be a past date")
    private LocalDate birthdate;
    @Pattern(regexp = "^(|\\d{9,11})$", message = "The 'phoneNumber' field must be empty or contain between 9 and 11 digits")
    private int phoneNumber;
    @NotBlank(message = "The 'password' field cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=])[A-Za-z\\d@#$%^&+=]{8,}$", message = "The 'password' must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from [@#$%^&+=], and have a minimum length of 8 characters.")
    private String password;
    private String token;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority((role.name())));
    }

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL)
    private List<Friendship> receivedFriendshipRequests = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    private List<Friendship> sentFriendshipRequests = new ArrayList<>();

    @ManyToMany(mappedBy = "users", cascade = CascadeType.ALL)
    private List<Task> tasks = new ArrayList<>();
    @ManyToMany(mappedBy = "users", cascade = CascadeType.ALL)
    private List<Event> events = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<TaskStatus> taskStatuses = new ArrayList<>();

    @OneToMany(mappedBy = "userNotif", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "userCalled", cascade = CascadeType.ALL)
    private List<Call> calls = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<JobUserRelation> jobUserRelations = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<JobInquirie> jobInquiries = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_friends",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    private List<User> friends = new ArrayList<>();

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
