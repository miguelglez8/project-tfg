package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.CallDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CallControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO johnDTO;
	private UserDTO stevenDTO;

	private CallDTO callDTO;

	@BeforeEach
	public void setup() throws Exception {
		johnDTO = new UserDTO();
		johnDTO.setId(1L);
		johnDTO.setFirstName("John");
		johnDTO.setLastName("Doe");
		johnDTO.setEmail("john.doe@example.com");
		johnDTO.setRole("STUDENT");
		johnDTO.setPassword("Password@123");
		johnDTO.setPlace("New York");
		johnDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		johnDTO.setPhoneNumber(681567567);

		stevenDTO = new UserDTO();
		stevenDTO.setId(2L);
		stevenDTO.setFirstName("Steven");
		stevenDTO.setLastName("Doe");
		stevenDTO.setEmail("steven.doe@example.com");
		stevenDTO.setRole("STUDENT");
		stevenDTO.setPassword("Password@456");
		stevenDTO.setPlace("Los Angeles");
		stevenDTO.setBirthdate(LocalDate.of(1995, 5, 15));
		stevenDTO.setPhoneNumber(987654321);

		callDTO = new CallDTO();
		callDTO.setId(1L);
		callDTO.setUserCall("steven.doe@example.com");
		callDTO.setType("incoming");
		callDTO.setDate(LocalDateTime.now());
		callDTO.setCallType("call");
		callDTO.setUserCalled("john.doe@example.com");

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(johnDTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(stevenDTO)));
	}

	@Test
	@Order(1)
	public void testRegisterSuccessful() throws Exception {
		mockMvc.perform(post("/api/calls")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(callDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Call saved successfully"));
	}

	@Test
	public void testRegisterUserNotFound() throws Exception {
		callDTO.setUserCalled("nonexistent@example.com");

		mockMvc.perform(post("/api/calls")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(callDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(2)
	public void testGetCallsSuccessful() throws Exception {
		mockMvc.perform(get("/api/calls/john.doe@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].userCall").value("steven.doe@example.com"));
	}

	@Test
	public void testGetCallsUserNotFound() throws Exception {
		mockMvc.perform(get("/api/calls/nonexistent@example.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}
}
