package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobInquirieDTO;
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
import java.util.Date;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class JobInquirieControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private UserDTO user2DTO;

	private UserDTO user3DTO;

	private UserDTO user4DTO;

	private UserDTO user5DTO;

	private JobDTO jobDTO;

	private JobInquirieDTO jobInquirieDTO;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("jonny@gmail.com");
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

		user3DTO = new UserDTO();
		user3DTO.setId(3L);
		user3DTO.setFirstName("John");
		user3DTO.setLastName("Doe");
		user3DTO.setEmail("florida@gmail.com");
		user3DTO.setRole("STUDENT");
		user3DTO.setPassword("Password@123");
		user3DTO.setPlace("New York");
		user3DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user3DTO.setPhoneNumber(681567567);

		user4DTO = new UserDTO();
		user4DTO.setId(4L);
		user4DTO.setFirstName("John");
		user4DTO.setLastName("Doe");
		user4DTO.setEmail("kevin@gmail.com");
		user4DTO.setRole("TEACHER");
		user4DTO.setPassword("Password@123");
		user4DTO.setPlace("New York");
		user4DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user4DTO.setPhoneNumber(681567567);

		user5DTO = new UserDTO();
		user5DTO.setId(5L);
		user5DTO.setFirstName("John");
		user5DTO.setLastName("Doe");
		user5DTO.setEmail("max@gmail.com");
		user5DTO.setRole("STUDENT");
		user5DTO.setPassword("Password@123");
		user5DTO.setPlace("New York");
		user5DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user5DTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user2DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user3DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user4DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user5DTO)));

		jobDTO = new JobDTO();
		jobDTO.setCreator("jonny@gmail.com");
		jobDTO.setTitle("JobToInquirie");
		jobDTO.setDescription("JobToInquirie Description");
		jobDTO.setRelatedSubject("Math");
		jobDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));

		jobInquirieDTO = new JobInquirieDTO();
		jobInquirieDTO.setSender("john@gmail.com");
		jobInquirieDTO.setReceiver("JobToInquirie");
		jobInquirieDTO.setDate(new Date());
	}

	@Test
	@Order(1)
	public void testAddJobInquirieSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Job saved successfully"));

		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("JobInquiries request sent successfully"));
	}

	@Test
	public void testAddJobInquirieUserNotFound() throws Exception {
		jobInquirieDTO.setSender("notExist@gmail.com");

		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testAddJobInquirieJobNotFound() throws Exception {
		jobInquirieDTO.setReceiver("notExist");

		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(2)
	public void testAddJobInquirieExceptionSent() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("You have already sent him a request"));
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testAddJobInquirieExceptionAlreadyInTeam() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("You are already in the team"));
	}

	@Test
	@Order(3)
	public void testGetSentJobInquiriesSuccessful() throws Exception {
		mockMvc.perform(get("/api/jobinquiries/sent")
						.contentType(MediaType.APPLICATION_JSON)
						.param("senderEmail", "john@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	public void testGetSentJobInquiriesUserNotFound() throws Exception {
		mockMvc.perform(get("/api/jobinquiries/sent")
						.contentType(MediaType.APPLICATION_JSON)
						.param("senderEmail", "notExist@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(4)
	public void testGetReceivedJobInquiriesSuccessful() throws Exception {
		mockMvc.perform(get("/api/jobinquiries/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	public void tesGetReceivedJobInquiriesFailureNotAdmin() throws Exception {
		mockMvc.perform(get("/api/jobinquiries/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("title", "JobToInquirie")
						.param("user", "john@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void tesGetReceivedJobInquiriesJobNotFound() throws Exception {
		mockMvc.perform(get("/api/jobinquiries/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("title", "notExist")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testCancelJobInquiriesRequestSuccessful() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/cancel")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie"))
				.andExpect(status().isOk())
				.andExpect(content().string("JobInquiries request canceled successfully"));
	}

	@Test
	public void testCancelJobInquiriesRequestUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/cancel")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "notExist@gmail.com")
						.param("title", "JobToInquirie"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testCancelJobInquiriesRequestJobNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/cancel")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "notExist"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(5)
	public void testAcceptJobInquiriesRequestSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("JobInquiries request accepted successfully"));
	}

	@Test
	public void testAcceptJobInquiriesRequestExceptionAdmin() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "john@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not admin"));
	}

	@Test
	public void testAcceptJobInquiriesRequestExceptionInTeam() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is already in the team"));
	}

	@Test
	@Order(Integer.MAX_VALUE-1)
	public void testAcceptJobInquiriesRequestExceptionCompleted() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","JobToInquirie")
						.param("userEmail","florida@gmail.com")
						.param("user","jonny@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member added successfully"));

		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","JobToInquirie")
						.param("userEmail","kevin@gmail.com")
						.param("user","jonny@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member added successfully"));

		jobInquirieDTO.setSender("max@gmail.com");

		mockMvc.perform(post("/api/jobinquiries/job-inquiries")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobInquirieDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("JobInquiries request sent successfully"));

		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "max@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Job is already completed"));
	}

	@Test
	public void testAcceptJobInquiriesRequestUserNotFound() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "notExist@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testAcceptJobInquiriesRequestJobNotFound() throws Exception {
		mockMvc.perform(post("/api/jobinquiries/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "notExist")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteJobInquiriesRequestSuccessful() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/delete")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("JobInquiries request deleted successfully"));
	}

	@Test
	public void testDeleteJobInquiriesRequestExceptionNotAdmin() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/delete")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "john@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testDeleteJobInquiriesRequestUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/delete")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "notExist@gmail.com")
						.param("title", "JobToInquirie")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteJobInquiriesRequestJobNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobinquiries/delete")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "john@gmail.com")
						.param("title", "notExist")
						.param("user", "jonny@gmail.com"))
				.andExpect(status().isNotFound());
	}

}
