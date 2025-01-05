package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class InformControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private JobDTO jobDTO;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("jony@gmail.com");
		userDTO.setRole("TEACHER");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		jobDTO = new JobDTO();
		jobDTO.setCreator("jony@gmail.com");
		jobDTO.setDescription("Job3 Description");
		jobDTO.setRelatedSubject("Math");
		jobDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
	}

	@Test
	public void testGetParticipationSuccessful() throws Exception {
		jobDTO.setTitle("Job3");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/informs/Job3/participation")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "jony@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].user").value("John Doe"))
				.andExpect(jsonPath("$[0].contribution").value(0));
	}

	@Test
	public void testGetParticipationNotFound() throws Exception {
		mockMvc.perform(get("/api/informs/notFound/participation")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "notExist@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetWeeklyControlSuccessful() throws Exception {
		jobDTO.setTitle("Job4");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/informs/Job4/controlWeek")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$", hasSize(7)));
	}

	@Test
	public void testGetWeeklyControlNotFound() throws Exception {
		mockMvc.perform(get("/api/informs/notFound/controlWeek")
							.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetMonthlyControlSuccessful() throws Exception {
		jobDTO.setTitle("Job5");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/informs/Job5/controlMonth"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$", hasSize(6)));
	}

	@Test
	public void testGetMonthlyControlNotFound() throws Exception {
		mockMvc.perform(get("/api/informs/notFound/controlMonth")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}
}
