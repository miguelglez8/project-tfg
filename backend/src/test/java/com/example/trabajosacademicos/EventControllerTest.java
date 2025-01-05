package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.JobDTO;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class EventControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private UserDTO user2DTO;

	private EventDTO eventDTO;

	private JobDTO jobDTO;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("prueba@gmail.com");
		userDTO.setRole("TEACHER");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		user2DTO = new UserDTO();
		user2DTO.setId(2L);
		user2DTO.setFirstName("John");
		user2DTO.setLastName("Doe");
		user2DTO.setEmail("john@gmail.com");
		user2DTO.setRole("TEACHER");
		user2DTO.setPassword("Password@123");
		user2DTO.setPlace("New York");
		user2DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user2DTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user2DTO)));

		eventDTO = new EventDTO();
		eventDTO.setId(1L);
		eventDTO.setName("Event Name");
		eventDTO.setSubject("Subject");
		eventDTO.setDeadlineDateTimeInit(LocalDateTime.now().plusDays(1));
		eventDTO.setDeadlineDateTimeFin(LocalDateTime.now().plusDays(2));
		eventDTO.setAssociatedAcademicWork("Job");
		eventDTO.setAssignedTo(new String[]{"prueba@gmail.com"});
		eventDTO.setAllDay(false);
		eventDTO.setLocation("Location");

		jobDTO = new JobDTO();
		jobDTO.setCreator("prueba@gmail.com");
		jobDTO.setTitle("Job");
		jobDTO.setDescription("Job Description");
		jobDTO.setRelatedSubject("Math");
		jobDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
	}

	@Test
	@Order(1)
	public void testRegisterEventSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/events")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Event saved successfully"));
	}

	@Test
	public void testRegisterEventFailure() throws Exception {
		eventDTO.setAssignedTo(new String[]{"john@gmail.com"});

		mockMvc.perform(post("/api/events")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testRegisterEventIllegalArgumentException() throws Exception {
		eventDTO.setDeadlineDateTimeInit(LocalDateTime.now().plusDays(2));
		eventDTO.setDeadlineDateTimeFin(LocalDateTime.now().plusDays(1));

		mockMvc.perform(post("/api/events")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testGetEventsByAssignedToSuccessful() throws Exception {
		mockMvc.perform(get("/api/events/prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value(eventDTO.getName()));
	}

	@Test
	public void testGetEventsByAssignedToNotExist() throws Exception {
		mockMvc.perform(get("/api/events/notExist@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get events"));

	}

	@Test
	public void testGetEventsByJobSuccessful() throws Exception {
		mockMvc.perform(get("/api/events/Job/job")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value(eventDTO.getName()));
	}

	@Test
	public void testGetEventsByJobFailure() throws Exception {
		mockMvc.perform(get("/api/events/Job/job")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "john@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testGetEventByIdSuccessful() throws Exception {
		mockMvc.perform(get("/api/events/1/id")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value(eventDTO.getName()));
	}

	@Test
	public void testGetEventByIdFailure() throws Exception {
		mockMvc.perform(get("/api/events/9/id")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get event"));
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testDeleteEventByIdSuccessful() throws Exception {
		mockMvc.perform(delete("/api/events/1/id")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Deleted successfully"));
	}

	@Test
	public void testDeleteEventByIdFailure() throws Exception {
		mockMvc.perform(delete("/api/events/8/id")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdateEventSuccessful() throws Exception {
		eventDTO.setLocation("EII");

		mockMvc.perform(put("/api/events/1")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com")
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.location").value(eventDTO.getLocation()));
	}

	@Test
	public void testUpdateEventFailure() throws Exception {
		mockMvc.perform(put("/api/events/1")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "john@gmail.com")
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdateEventIllegalArgumentException() throws Exception {
		eventDTO.setDeadlineDateTimeInit(LocalDateTime.now().plusDays(2));
		eventDTO.setDeadlineDateTimeFin(LocalDateTime.now().plusDays(1));

		mockMvc.perform(put("/api/events/1")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com")
						.content(objectMapper.writeValueAsString(eventDTO)))
				.andExpect(status().isBadRequest());
	}

}
