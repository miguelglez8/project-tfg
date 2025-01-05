package com.example.trabajosacademicos;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class StatsControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("miky@gmail.com");
		userDTO.setRole("TEACHER");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));
	}

	@Test
	public void testGetStatsSuccessful() throws Exception {
		mockMvc.perform(get("/api/stats/miky@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.participatingJobs").value(0))
				.andExpect(jsonPath("$.averageJobGrade").value(0.0))
				.andExpect(jsonPath("$.completedJobsPercentage").value(0.0))
				.andExpect(jsonPath("$.jobsDeadlineStatusPercentage").value(0.0))
				.andExpect(jsonPath("$.averageTasksPerJob").value(0.0))
				.andExpect(jsonPath("$.averageEventsPerJob").value(0.0))
				.andExpect(jsonPath("$.realizedTasks").value(0))
				.andExpect(jsonPath("$.assignedTasks").value(0))
				.andExpect(jsonPath("$.completedTasksPercentage").value(0.0))
				.andExpect(jsonPath("$.remainingTasksPercentage").value(0.0))
				.andExpect(jsonPath("$.averageObjectivesPerTask").value(0.0))
				.andExpect(jsonPath("$.completedObjectivesPercentage").value(0.0))
				.andExpect(jsonPath("$.tasksDeadlineStatusPercentage").value(0.0))
				.andExpect(jsonPath("$.fullTimeEvents").value(0))
				.andExpect(jsonPath("$.partTimeEvents").value(0))
				.andExpect(jsonPath("$.averageEventDuration").value(0.0))
				.andExpect(jsonPath("$.averageParticipantsPerEvent").value(0.0));
		}

	@Test
	public void testGetStatsNotFound() throws Exception {
		mockMvc.perform(get("/api/stats/notExist@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}
}
