package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.requests.PasswordRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	@BeforeEach
	public void setup() {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("mike.doe@example.com");
		userDTO.setRole("STUDENT");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);
	}

	@Test
	@Order(1)
	public void testRegisterSuccessful() throws Exception {
		mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(userDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("User registered!"));
	}

	@Test
	public void testRegisterUserRegistered() throws Exception {
		UserDTO invalidUser = new UserDTO();
		invalidUser.setEmail("mike.doe@example.com");

		mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(invalidUser)))
				.andExpect(status().isBadRequest());
	}

	@Test
	@Order(2)
	public void testGetAllSuccessful() throws Exception {
		mockMvc.perform(get("/api/users")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()", greaterThan(0)));
	}

	@Test
	public void testGetUserByEmailSuccessful() throws Exception {
		mockMvc.perform(get("/api/users/mike.doe@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("mike.doe@example.com"));
	}

	@Test
	public void testGetUserByEmailUserNotFound() throws Exception {
		mockMvc.perform(get("/api/users/nonexistent@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdateUserSuccessful() throws Exception {
		UserDTO updatedUserDTO = new UserDTO();
		updatedUserDTO.setLastName("Smith");

		mockMvc.perform(put("/api/users/mike.doe@example.com")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(updatedUserDTO)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.lastName").value("Smith"));
	}

	@Test
	public void testUpdateUserUserNotFound() throws Exception {
		UserDTO updatedUserDTO = new UserDTO();
		updatedUserDTO.setFirstName("John");
		updatedUserDTO.setLastName("Smith");

		mockMvc.perform(put("/api/users/nonexistent@example.com")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(updatedUserDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdatePassword() throws Exception {
		PasswordRequest passwordRequest = new PasswordRequest();
		passwordRequest.setPassword("NewPassword@123");

		mockMvc.perform(put("/api/users/mike.doe@example.com/password")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(passwordRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("mike.doe@example.com"));
	}

	@Test
	public void testUpdatePasswordUserNotFound() throws Exception {
		PasswordRequest passwordRequest = new PasswordRequest();
		passwordRequest.setPassword("NewPassword@123");

		mockMvc.perform(put("/api/users/nonexistent@example.com/password")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(passwordRequest)))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(2)
	public void testCheckPassword() throws Exception {
		PasswordRequest passwordRequest = new PasswordRequest();
		passwordRequest.setPassword("Password@123");

		mockMvc.perform(post("/api/users/mike.doe@example.com/check-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(passwordRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").value(true));
	}

	@Test
	public void testCheckPasswordIncorrectPassword() throws Exception {
		PasswordRequest passwordRequest = new PasswordRequest();
		passwordRequest.setPassword("Password@1234");

		mockMvc.perform(post("/api/users/mike.doe@example.com/check-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(passwordRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").value(false));
	}

	@Test
	public void testCheckPasswordUserNotFound() throws Exception {
		PasswordRequest passwordRequest = new PasswordRequest();
		passwordRequest.setPassword("Password@123");

		mockMvc.perform(post("/api/users/nonexistent@example.com/check-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(passwordRequest)))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testDeleteUser() throws Exception {
		mockMvc.perform(delete("/api/users/mike.doe@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("Deleted successfully"));
	}

	@Test
	public void testDeleteUserUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/users/nonexistent@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}
}
