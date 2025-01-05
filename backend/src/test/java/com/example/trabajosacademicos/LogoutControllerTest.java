package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.requests.AuthRequest;
import com.example.trabajosacademicos.requests.LogoutRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class LogoutControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private AuthRequest authRequest;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("john.doe@example.com");
		userDTO.setRole("STUDENT");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		authRequest = new AuthRequest("john.doe@example.com", "Password@123");

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		mockMvc.perform(post("/api/auth")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(authRequest)));
	}

	@Test
	public void testLogoutSuccessful() throws Exception {
		LogoutRequest logoutRequest = new LogoutRequest("john.doe@example.com");

		mockMvc.perform(post("/api/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(logoutRequest)))
				.andExpect(status().isOk());
	}

	@Test
	public void testLogoutInvalidCredentials() throws Exception {
		LogoutRequest logoutRequest = new LogoutRequest("notExist@example.com");

		mockMvc.perform(post("/api/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(logoutRequest)))
				.andExpect(status().isUnauthorized())
				.andExpect(content().string("Invalid credentials"));

	}
}
