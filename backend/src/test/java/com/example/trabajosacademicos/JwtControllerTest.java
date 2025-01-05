package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.requests.AuthRequest;
import com.example.trabajosacademicos.requests.TokenRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class JwtControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;
	private TokenRequest tokenRequest;

	@BeforeEach
	public void setup() {
		tokenRequest = new TokenRequest();
		tokenRequest.setUserId("john.doe@example.com");
		tokenRequest.setEffectiveTimeInSeconds(3600);
	}

	@Test
	@Order(1)
	public void testValidateTokenSuccessful() throws Exception {
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

		AuthRequest authRequest = new AuthRequest("john.doe@example.com", "Password@123");

		mockMvc.perform(MockMvcRequestBuilders.post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		ResultActions resultActions = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(authRequest)));

		String token = getToken(resultActions);

		mockMvc.perform(get("/api/token")
						.contentType(MediaType.APPLICATION_JSON)
						.param("token", token)
						.param("email", "john.doe@example.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));
	}

	@Test
	public void testValidateTokenNotValid() throws Exception {
		mockMvc.perform(get("/api/token")
						.contentType(MediaType.APPLICATION_JSON)
						.param("token", "notValidToken")
						.param("email", "john.doe@example.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	public void testValidateTokenUserNotFound() throws Exception {
		mockMvc.perform(get("/api/token")
						.contentType(MediaType.APPLICATION_JSON)
						.param("token", "anyToken")
						.param("email", "user@example.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGenerateTokenSuccessful() throws Exception {
		MvcResult result = mockMvc.perform(post("/api/token")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(tokenRequest)))
				.andExpect(status().isOk())
				.andReturn();

		String contentType = result.getResponse().getContentType();
		String responseContent = result.getResponse().getContentAsString();

		assertNotNull(responseContent);
		assertTrue(contentType != null && contentType.contains("text/plain;charset=UTF-8"));
	}
	private String getToken(ResultActions resultActions) throws UnsupportedEncodingException, JsonProcessingException {
		MvcResult mvcResult = resultActions.andReturn();
		String responseJson = mvcResult.getResponse().getContentAsString();
		JsonNode jsonNode = objectMapper.readTree(responseJson);
		String token = jsonNode.get("token").asText();
		return token;
	}

}
